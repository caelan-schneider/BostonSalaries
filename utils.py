import numpy as np
from flask_pymongo import PyMongo

class MongoCollection:

    def __init__(self, app, db_name, collection_name, port="localhost:27017"):
        self.app = app
        self.app.config['JSON_SORT_KEYS'] = False
        self.app.config['MONGO_DBNAME'] = db_name
        self.app.config['MONGO_URI'] = "mongodb://" + port + "/" + db_name
        self.db = PyMongo(self.app).db
        self.collection = self.db[collection_name]

    #helper method to impute all missing years between the earliest year and latest year
    @staticmethod
    def _impute_missing_years(docs, fields):
    
        existing_years = set(doc["Year"] for doc in docs)
        all_years = set(year for year in range(min(existing_years), max(existing_years)+1))
        missing_years = list(all_years - existing_years)

        for year in missing_years:
            doc = {field: 0 for field in fields}
            doc["Year"] = year
            docs.append(doc)
                
        docs.sort(key=lambda k: k["Year"])
        return docs

  
    #return list of documents after filtering that match projection schema
    def get_documents(self, filter, projection):
        projection["_id"] = False
        return [doc for doc in self.collection.find(filter, projection)]

    #return sorted list of distinct values for given dimension after filtering
    def unique_values(self, filter, field, is_desc=False):
        query = self.collection.distinct(field, filter)
        docs = [doc for doc in query]
        docs.sort(reverse=is_desc)
        return docs

    #return sorted list of unique pairings of values for two given dimensions
    def unique_dim_pairs(self, dim_1, dim_2, is_desc=False):
        query = [{
            "$group": {
            "_id": {dim_1: "$" + dim_1, dim_2: "$" + dim_2}
        }}]
        docs = [doc["_id"] for doc in self.collection.aggregate(query) if len(doc["_id"]) == 2]
        docs.sort(key=lambda k: k[dim_1] + k[dim_2], reverse=is_desc)
        return docs

    #return pivot dictionary on specified columns with given aggregation function and group by
    def pivot(self, filter, agg_type, group_by, pivot_fields, round_by=2):
        group = {field: {"$"+agg_type: "$"+field} for field in pivot_fields}
        group["_id"] = "$" + group_by
        query = self.collection.aggregate([
            {"$match" : filter},
            {"$group" : group},
            {"$sort" : {"_id" : 1}}
        ])
        docs = [doc for doc in query]
        for doc in docs:
            for k, v in doc.items():
                doc[k] = round(v, round_by)
            doc[group_by] = doc["_id"]
            doc["_id"] = str(doc["_id"]) + "-" + agg_type

        if group_by == "Year":
            return MongoCollection._impute_missing_years(docs, pivot_fields) 
        return docs

    #count the instances of given field after filtering, optionally grouped by another field
    def count_instance_of_field(self, filter, field, group_by):
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

                # if group_by == "Year":
                #     docs = MongoCollection._impute_missing_years(docs, ["count"])
        else:
            doc["_id"] = field + "Count" 
            
        return docs

    #get top n documents based on given field after applying given filter
    def top_n(self, filter, sort_field, n):
        query = self.collection.find(filter, {'_id':False}).sort(sort_field, -1).limit(n)
        docs = [doc for doc in query]
        return docs

    #returns histogram of given field with given number of bins after applying given filter
    def histogram(self, filter, field, num_bins=15, round_by=2):
        data = [doc[field] for doc in self.get_documents(filter, {field:True})]
        h, b = np.histogram(data, bins=num_bins)
        docs = [{"bin": round(bin, round_by), "hist": hist} for bin, hist in zip(b[1:].tolist(), h.tolist())]
        return docs
