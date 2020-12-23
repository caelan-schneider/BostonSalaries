from flask import Flask, jsonify, request, render_template
from flask_pymongo import PyMongo
import numpy as np
import simplejson as json

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

app.config['MONGO_DBNAME'] = 'boston_salaries'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/boston_salaries'

mongo = PyMongo(app)

#helper method for API routes
def get_documents(filter_by, select_by, db):
    select_by["_id"] = False
    docs = [doc for doc in db.find(filter_by, select_by)]
    if docs:
        output = docs
        #output=jsonify(docs)
    else:
        output = 'No results found.'
    return output

#helper method for API routes
def get_aggregate_by_year(dic, db, agg):
    agg_tag = "$" + agg
    query = db.aggregate([
        {"$match" : dic},
        {"$group" : {
                "_id" : "$Year",
                "Regular" : {agg_tag: "$Regular"},
                "Retro": {agg_tag : "$Retro"},
                "Overtime": {agg_tag : "$Overtime"},
                "Injury": {agg_tag : "$Injury"},
                "Other": {agg_tag : "$Other"},
                "Total": {agg_tag : "$Total"}}},
        {"$sort" : {"_id" : 1}}
    ])
    docs = [doc for doc in query]
    for doc in docs:
        for k, v in doc.items():
            doc[k] = round(v, 2)
        doc["Year"] = doc["_id"]
        doc["_id"] = str(doc["_id"]) + "-" + agg
    return docs

#helper method for API routes
def get_count_by_year(dic, db, col):
    query = db.aggregate([
        {"$match" : {"$and" : [dic, {col: {"$gt":0}}] }},
        {"$group" : {
            "_id" : "$Year",
            "count": {"$sum" : 1}
        }},
        {"$sort" : {"_id" : 1}}
    ]) 
    docs = [doc for doc in query]

    for doc in docs:
        doc["Year"] = doc["_id"]
        doc["_id"] = str(doc["_id"]) + "-" + col + "Count"

    years = get_all_years(dic, db)

    if len(years) > 0:
        for year in range(years[-1], years[0]+1):
            if year not in [doc["Year"] for doc in docs]:
                docs.append({"Year":year, "count":0})   
        docs.sort(key=lambda k: k["Year"])
    return docs

def get_all_years(dic, db):
    query = db.distinct("Year", dic)
    docs = [doc for doc in query]
    docs.sort(reverse=True)
    return docs

#helper method for API routes
def get_top_n_for_year(dic, db, year, col, n):
    query = db.find({"$and" : [dic, {"Year":year}]}, {'_id':False}).sort(col, -1).limit(n)
    docs = [doc for doc in query]
    return {"data" : docs}

#helper method for API routes
def get_totals_for_year(dic, db, year):
    query = [doc['Total'] for doc in get_documents({"$and": [dic, {"Year":year}]}, {"Total":True}, db)]
    h, b = np.histogram(query, bins=20)
    docs = [{"bin": round(bin, 2), "hist": hist} for bin, hist in zip(b[1:].tolist(), h.tolist())]
    return {"data" : docs}

@app.route('/')
def display_all():
    salaries = mongo.db.salaries
    sums = get_aggregate_by_year({}, salaries, "sum")
    avgs = get_aggregate_by_year({}, salaries, "avg")
    injuries = get_count_by_year({}, salaries, "Injury")
    numEmployees = get_count_by_year({}, salaries, "Total")
    allYears = get_all_years({}, salaries)
    
    return render_template('index.html' \
        , sums = sums \
        , avgs = avgs \
        , injuries = injuries \
        , numEmployees = numEmployees \
        , allYears = allYears)



@app.route('/employee/', methods=['GET'])
def employee_by_name_json():
    salaries = mongo.db.salaries
    first = request.args.get('first')
    last = request.args.get('last')
    return get_documents({'First':first, 'Last':last}, {}, salaries)



@app.route('/topnforyear', methods=['GET'])
def top_n_employees_json():
    salaries = mongo.db.salaries
    year = int(request.args.get("forYear", None))
    pageType = request.args.get("pageType", None)
    value = request.args.get("value", None)
    print(pageType)
    print(value)
    if pageType == "" and value == "": 
        return get_top_n_for_year({}, salaries, year, "Total", 10)
    return get_top_n_for_year({pageType.title() : value}, salaries, year, "Total", 10)



@app.route('/salaryhistogram', methods=['GET'])
def salary_histogram_json():
    salaries = mongo.db.salaries
    year = int(request.args.get("forYear", None))
    pageType = request.args.get("pageType", None)
    value = request.args.get("value", None)
    print(pageType)
    print(value)
    if pageType == "" and value == "": 
        return get_totals_for_year({}, salaries, year)
    return get_totals_for_year({pageType.title() : value}, salaries, year)



@app.route('/cabinet/<cabinet>', methods=['GET'])
def display_employees_by_cabinet(cabinet):
    value = cabinet.upper()
    salaries = mongo.db.salaries
    sums = get_aggregate_by_year({'Cabinet':value}, salaries, "sum")
    avgs = get_aggregate_by_year({'Cabinet':value}, salaries, "avg")
    injuries = get_count_by_year({"Cabinet":value}, salaries, "Injury")
    numEmployees = get_count_by_year({"Cabinet":value}, salaries, "Total")
    allYears = get_all_years({"Cabinet":value}, salaries)

    return render_template('index.html' \
        , pageType = "cabinet" \
        , value = value \
        , sums = sums \
        , avgs = avgs \
        , injuries=injuries \
        , numEmployees = numEmployees \
        , allYears = allYears)



@app.route('/department/<dept>', methods=['GET'])
def display_employees_by_department(dept):
    value = dept.upper()
    salaries = mongo.db.salaries
    sums = get_aggregate_by_year({'Department':value}, salaries, "sum")
    avgs = get_aggregate_by_year({'Department':value}, salaries, "avg")
    injuries = get_count_by_year({"Department": value}, salaries, "Injury")
    numEmployees = get_count_by_year({"Department": value}, salaries, "Total")
    allYears = get_all_years({"Department":value}, salaries)

    return render_template('index.html' \
        , pageType = "department" \
        , value = value \
        , sums = sums \
        , avgs = avgs \
        , injuries=injuries \
        , numEmployees = numEmployees \
        , allYears = allYears)



@app.route('/department/<dept>/program/<program>', methods=['GET'])
def display_employees_by_program(dept, program):
    value = program.upper()
    salaries = mongo.db.salaries
    sums = get_aggregate_by_year({"$and" : [{'Department':dept},{'Program':value}]}, salaries, "sum")
    avgs = get_aggregate_by_year({"$and" : [{'Department':dept},{'Program':value}]}, salaries, "avg")
    injuries = get_count_by_year({"$and" : [{'Department':dept},{'Program':value}]}, salaries, "Injury")
    numEmployees = get_count_by_year({"$and" : [{'Department':dept},{'Program':value}]}, salaries, "Total")
    allYears = get_all_years({"$and" : [{'Department':dept},{'Program':value}]}, salaries)

    return render_template('index.html' \
        , pageType = "program" \
        , value = value \
        , dept = dept \
        , sums = sums \
        , avgs = avgs \
        , injuries=injuries \
        , numEmployees = numEmployees \
        , allYears = allYears)
        

if __name__ == '__main__':
    app.run(debug=True)


