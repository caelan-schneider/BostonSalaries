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

    years = get_all_unique(dic, db, "Year", is_desc=True)

    if len(years) > 0:
        for year in range(years[-1], years[0]+1):
            if year not in [doc["Year"] for doc in docs]:
                docs.append({"Year":year, "count":0})   
        docs.sort(key=lambda k: k["Year"])
    return docs

#helper method for API routes
def get_all_unique(dic, db, col, is_desc=False):
    query = db.distinct(col, dic)
    docs = [doc for doc in query]
    docs.sort(reverse=is_desc)
    return docs

#helper method for API routes
def get_top_n_for_year(dic, db, year, col, n):
    query = db.find({"$and" : [dic, {"Year":year}]}, {'_id':False}).sort(col, -1).limit(n)
    docs = [doc for doc in query]
    return {"data" : docs}

#helper method for API routes
def get_totals_for_year(dic, db, year):
    query = [doc['Total'] for doc in get_documents({"$and": [dic, {"Year":year}]}, {"Total":True}, db)]
    h, b = np.histogram(query, bins=15)
    docs = [{"bin": round(bin, 2), "hist": hist} for bin, hist in zip(b[1:].tolist(), h.tolist())]
    return {"data" : docs}




@app.route('/')
def display_all():
    salaries = mongo.db.salaries
    sums = get_aggregate_by_year({}, salaries, "sum")
    avgs = get_aggregate_by_year({}, salaries, "avg")
    injuries = get_count_by_year({}, salaries, "Injury")
    numEmployees = get_count_by_year({}, salaries, "Total")
    allYears = get_all_unique({}, salaries, "Year", is_desc=True)
    
    return render_template('index.html' \
        , pathRoot = "http://localhost:5000/" \
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
    pageType = request.args.get("pageType", None).title()
    value = request.args.get("value", None)
    if pageType == "" and value == "": 
        return get_top_n_for_year({}, salaries, year, "Total", 10)
    return get_top_n_for_year({pageType : value}, salaries, year, "Total", 10)



@app.route('/salaryhistogram', methods=['GET'])
def salary_histogram_json():
    salaries = mongo.db.salaries
    year = int(request.args.get("forYear", None))
    pageType = request.args.get("pageType", None).title()
    value = request.args.get("value", None)
    if pageType == "" and value == "": 
        return get_totals_for_year({}, salaries, year)
    return get_totals_for_year({pageType : value}, salaries, year)



@app.route('/divisionoptions', methods=['GET'])
def division_options_json():
    salaries = mongo.db.salaries
    selected = request.args.get("selected", None)
    if selected not in ("Department", "Cabinet"):
        return {"options":[]}
    return {"options":get_all_unique({}, salaries, selected)}



@app.route('/programoptions', methods=['GET'])
def program_options_json():
    salaries = mongo.db.salaries
    selected = request.args.get("selected", None)
    options = get_all_unique({"Department":selected}, salaries, "Program")
    return {"options": options}



@app.route('/cabinet/<cabinet>', methods=['GET'])
def display_employees_by_cabinet(cabinet):
    cabinet = cabinet.upper()
    value = cabinet
    salaries = mongo.db.salaries
    sums = get_aggregate_by_year({'Cabinet':cabinet}, salaries, "sum")
    avgs = get_aggregate_by_year({'Cabinet':cabinet}, salaries, "avg")
    injuries = get_count_by_year({"Cabinet":cabinet}, salaries, "Injury")
    numEmployees = get_count_by_year({"Cabinet":cabinet}, salaries, "Total")
    allYears = get_all_unique({"Cabinet":cabinet}, salaries, "Year", is_desc=True)

    return render_template('index.html' \
        , pathRoot = "http://localhost:5000/" \
        , pageType = "cabinet" \
        , value = value \
        , sums = sums \
        , avgs = avgs \
        , injuries=injuries \
        , numEmployees = numEmployees \
        , allYears = allYears)



@app.route('/department/<dept>', methods=['GET'])
def display_employees_by_department(dept):
    dept = dept.upper()
    value = dept
    salaries = mongo.db.salaries
    sums = get_aggregate_by_year({'Department':dept}, salaries, "sum")
    avgs = get_aggregate_by_year({'Department':dept}, salaries, "avg")
    injuries = get_count_by_year({"Department": dept}, salaries, "Injury")
    numEmployees = get_count_by_year({"Department": dept}, salaries, "Total")
    allYears = get_all_unique({"Department":dept}, salaries, "Year", is_desc=True)

    return render_template('index.html' \
        , pathRoot = "http://localhost:5000/" \
        , pageType = "department" \
        , value = value \
        , sums = sums \
        , avgs = avgs \
        , injuries=injuries \
        , numEmployees = numEmployees \
        , allYears = allYears)



@app.route('/department/<dept>/program/<program>', methods=['GET'])
def display_employees_by_program(dept, program):
    dept = dept.upper()
    program = program.upper()
    value = program
    salaries = mongo.db.salaries
    sums = get_aggregate_by_year({"$and" : [{'Department':dept},{'Program':program}]}, salaries, "sum")
    avgs = get_aggregate_by_year({"$and" : [{'Department':dept},{'Program':program}]}, salaries, "avg")
    injuries = get_count_by_year({"$and" : [{'Department':dept},{'Program':program}]}, salaries, "Injury")
    numEmployees = get_count_by_year({"$and" : [{'Department':dept},{'Program':program}]}, salaries, "Total")
    allYears = get_all_unique({"$and" : [{'Department':dept},{'Program':program}]}, salaries, "Year", is_desc=True)

    return render_template('index.html' \
        , pathRoot = "http://localhost:5000/" \
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


