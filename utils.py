import numpy as np
from flask_pymongo import PyMongo
from flask.app import Flask
from typing import List, Dict

class MongoCollection:

    def __init__(self, app: Flask, db_name: str, collection_name: str, port: str ="localhost:27017"):
        self.app = app
        self.app.config['JSON_SORT_KEYS'] = False
        self.app.config['MONGO_DBNAME'] = db_name
        self.app.config['MONGO_URI'] = "mongodb://" + port + "/" + db_name
        self.db = PyMongo(self.app).db
        self.collection = self.db[collection_name]

    #helper method to impute all missing years between the earliest year and latest year
    @staticmethod
    def _impute_missing_years(docs: Dict, fields: List[str]):
    
        existing_years = set(doc["Year"] for doc in docs if "Year" in doc.keys())
        if len(existing_years) > 1:
            all_years = set(year for year in range(min(existing_years), max(existing_years)+1))
            missing_years = list(all_years - existing_years)

            for year in missing_years:
                doc = {field: 0 for field in fields}
                doc["Year"] = year
                docs.append(doc)
                    
            docs.sort(key=lambda doc: doc["Year"])
            
        return docs

    #return list of documents after filtering that match projection schema
    def get_documents(self, filter: Dict, projection: Dict = {}):
        projection["_id"] = 0
        docs = [doc for doc in self.collection.find(filter, projection)]
        print(docs)
        return docs

    #return sorted list of distinct values for given dimension after filtering
    def unique_values(self, filter: Dict, field: str, is_desc: bool = False):
        query = self.collection.distinct(field, filter)
        docs = [doc for doc in query if doc is not None]
        docs.sort(reverse=is_desc)
        return docs

    #return sorted list of unique pairings of values for two given dimensions
    def unique_dim_pairs(self, dim_1: str, dim_2: str, is_desc: bool = False):
        query = [{
            "$group": {
            "_id": {dim_1: "$" + dim_1, dim_2: "$" + dim_2}
        }}]
        docs = [doc["_id"] for doc in self.collection.aggregate(query) if len(doc["_id"]) == 2]
        docs.sort(key=lambda k: k[dim_1] + k[dim_2], reverse=is_desc)
        return docs

    #return pivot dictionary on specified columns with given aggregation function and group by
    def pivot(self, filter, agg: str, group_by: str, pivot_on: List[str], round_by: int = 2):
        if group_by in pivot_on:
            raise ValueError(f"group_by {group_by} cannot be in pivot_on list")
        group = {field: {"$"+agg: "$"+field} for field in pivot_on}
        group["_id"] = "$" + group_by
        query = self.collection.aggregate([
            {"$match" : filter},
            {"$group" : group},
            {"$sort" : {"_id" : 1}}
        ])
        docs = [doc for doc in query]
        for doc in docs:
            for k, v in doc.items():
                try:
                    doc[k] = round(v, round_by)
                except Exception as err:
                    print(err)
                    raise ValueError(f"Invalid key/value pair in document: key:{k} value:{v}.")
            doc[group_by] = doc["_id"]
            doc["_id"] = str(doc["_id"]) + "-" + agg

        if group_by == "Year":
            return MongoCollection._impute_missing_years(docs, pivot_on) 
        return docs

    #count the instances of given field after filtering, optionally grouped by another field
    def count_instance_of_field(self, filter: Dict, field: str, group_by: str):
        group = {}
        if group_by:
            group = {
                "_id" : "$"+group_by,
                "count": {"$sum" : 1}
            }
        query = self.collection.aggregate([
            {"$match" : {"$and" : [{k: v} for k, v in filter.items()]+[{field: {"$gt":0}}]}},
            {"$group" : group},
            {"$sort" : {"_id" : 1}}
        ]) 
        docs = [doc for doc in query]
        if group_by:
            for doc in docs:
                doc[group_by] = doc["_id"]
                doc["_id"] = str(doc["_id"]) + "-" + field + "Count"
          

            if group_by == "Year":
                docs = MongoCollection._impute_missing_years(docs, ["count"])
        else:
            doc["_id"] = field + "Count" 
            
        return docs

    #get top n documents based on given field after applying given filter
    def top_n(self, filter: Dict, sort_on: str, n: int):
        query = self.collection.find(filter, {'_id':False}).sort(sort_on, -1).limit(n)
        docs = [doc for doc in query]
        return docs

    #returns histogram of given field with given number of bins after applying given filter
    def histogram(self, filter: Dict, field: str, num_bins: int = 15, round_by: int = 2):
        data = [doc[field] for doc in self.get_documents(filter, {field:True}) if field in doc.keys()]
        h, b = np.histogram(data, bins=num_bins)
        docs = [{"bin": round(bin, round_by), "hist": hist} for bin, hist in zip(b[1:].tolist(), h.tolist())]
        return docs
