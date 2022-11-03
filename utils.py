import numpy as np
from flask_pymongo import pymongo
from flask.app import Flask
from typing import List, Dict

class MongoCollection:

    def __init__(self, app: Flask, collection_name: str, connection_str: str):
        self.app = app
        self.app.config["JSON_SORT_KEYS"] = False
        
        self.connection_str = connection_str
        self.client = pymongo.MongoClient(connection_str)
        self.db = self.client.db
        self.collection = self.db[collection_name]

    @staticmethod
    def _impute_missing_years(docs: List[Dict], fields: List[str], default=0) -> List[Dict]:
        """
        Returns list of documents with all years included. The years that were missing
        in the input list are added with given fields set to the default.

        Params:
            docs: List of dicts that each have a "Year" field.
            fields: The fields in the imputed docs that should be set to the default value.
            default: The default value.
        """

        existing_years = set(doc["Year"] for doc in docs if "Year" in doc.keys())
        if len(existing_years) > 1:
            all_years = set(year for year in range(min(existing_years), max(existing_years)+1))
            missing_years = list(all_years - existing_years)

            for year in missing_years:
                doc = {field: default for field in fields}
                doc["Year"] = year
                docs.append(doc)
                    
            docs.sort(key=lambda doc: doc["Year"])
            
        return docs

    def get_documents(self, filter: Dict, projection: Dict = {}) -> List[Dict]:
        """
        Return list of documents after filtering that match projection schema.
        
        Params:
            filter: The filter to be applied to the collection.
            projection: The schema of the documents in the output.
        """

        projection["_id"] = 0
        docs = [doc for doc in self.collection.find(filter, projection)]
        return docs

    def unique_values(self, filter: Dict, field: str, is_desc: bool = False) -> List[str]:
        """
        Return sorted list of distinct values for given dimension after filtering.

        Params:
            filter: The filter to be applied to the collection.
            field: The field where the unique values are retreived from.
            is_desc: Descending flag.

        """
        query = self.collection.distinct(field, filter)
        docs = [doc for doc in query if doc is not None]
        docs.sort(reverse=is_desc)
        return docs

    def unique_dim_pairs(self, dim_1: str, dim_2: str, is_desc: bool = False) -> List[Dict]:
        """
        Return sorted list of unique pairings of values for two given dimensions.

        Params:
            dim_1: The first dimension in the pair.
            dim_2: The second dimension in the pair.
            is_desc: Descending flag (alphabetical).
        """

        query = [{
            "$group": {
            "_id": {dim_1: "$" + dim_1, dim_2: "$" + dim_2}
        }}]
        docs = [doc["_id"] for doc in self.collection.aggregate(query) if len(doc["_id"]) == 2]
        docs.sort(key=lambda k: k[dim_1] + k[dim_2], reverse=is_desc)
        return docs

    def pivot(self, filter: Dict, agg: str, group_by: str, pivot_on: List[str], round_by: int = 2) -> List[Dict]:
        """
        Returns a list of dictionaries with specified fields, 
        aggregated by given aggregation function and group by field

        Params:
            filter: The filter to be applied to the collection.
            agg: The aggregation function (sum, avg) applied to the given fields.
            group_by: The dimension to group on.
            pivot_on: The fields that should be aggregated.
            round_by: The number of digits after the decimal point in resulting aggregate.

        """
        if group_by in pivot_on:
            raise ValueError(f"group_by {group_by} cannot be in pivot_on list")

        if agg not in ("sum", "avg", "max", "min"):
            raise ValueError(f"agg must be one of sum, avg, max, min.")
        
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

    def count_instance_of_field(self, filter: Dict, field: str, group_by: str) -> List[Dict]:
        """
        Count all instances of given field in Mongo collection after filtering
        and optionally group by another field.

        Params:
            filter: The filter to be applied to the collection.
            field: The dimension from with unique values to be counted.
            group_by: The (optional) dimension to group on.
        """

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

    def top_n(self, filter: Dict, sort_on: str, n: int) -> List[Dict]:
        """
        Get top n documents from collection based on given field after applying given filter.

        Params:
            filter: The filter to be applied to the collection.
            sort_on: The field from which the top n values are computed.
            n: The number of documents to return.
        """

        query = self.collection.find(filter, {'_id':False}).sort(sort_on, -1).limit(n)
        docs = [doc for doc in query]
        return docs

    def histogram(self, filter: Dict, field: str, num_bins: int = 15, round_by: int = 2) -> List[Dict]:
        """
        Return histogram of given field with given number of bins after applying given filter.

        Params:
            filter: The filter to be applied to the collection.
            field: The field from which the histogram is calculated.
            num_bins: The number of bins in the resulting histogram.
            round_by: The number of digits after the decimal point in the histogram x axis.
        """

        data = [doc[field] for doc in self.get_documents(filter, {field:True}) if field in doc.keys()]
        h, b = np.histogram(data, bins=num_bins)
        docs = [{"bin": round(bin, round_by), "hist": hist} for bin, hist in zip(b[1:].tolist(), h.tolist())]
        return docs
