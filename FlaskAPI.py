from flask import Flask, jsonify, request, render_template
from flask_pymongo import PyMongo
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
    return docs

def get_all_years(dic, db):
    query = db.distinct("Year", dic)
    docs = [doc for doc in query]
    docs.sort(reverse=True)
    return docs

#helper method for API routes
def get_top_n_by_year(dic, db, years, col, n):
    docs = {}
    for year in years:
        query = db.find({"$and" : [dic, {"Year":year}]}, {'_id':False}).sort(col, -1).limit(n)
        docs[year] = [doc for doc in query]
    return docs

def get_totals_by_year(dic, db, years):
    docs = {}
    for year in years:
        query = get_documents({"$and": [dic, {"Year":year}]}, {"Year":True, "Total":True}, db)
        docs[year] = query
    return docs


def get_subgroup_counts(dic, db, group, year):
    if group not in ("Cabinet", "Department", "Program"):
        raise ValueError("Input is not a valid group.")
    query = db.aggregate([
        {"$match": {"$and" : [{group: {"$exists" : True}}, dic, {"Year": year}]}},
        {"$group" : {
            "_id" : "$"+group
            ,"count": {"$sum" : 1}
        }},
        {"$sort" : {"_id" : 1}}
    ]) 
    docs = [doc for doc in query]
    return docs 

@app.route('/')
def get_all():
    salaries = mongo.db.salaries
    sums = get_aggregate_by_year({}, salaries, "sum")
    avgs = get_aggregate_by_year({}, salaries, "avg")
    injuries = get_count_by_year({}, salaries, "Injury")
    numEmployees = get_count_by_year({}, salaries, "Total")
    allYears = get_all_years({}, salaries)
    topTenEmployees = get_top_n_by_year({}, salaries, allYears, "Total", 10)
    totalsForYear = get_totals_by_year({}, salaries, allYears)
    
    return render_template('departments.html' \
        , dept = "ALL EMPLOYEES" \
        , sums = sums \
        , avgs = avgs \
        , injuries = injuries \
        , numEmployees = numEmployees \
        , allYears = allYears \
        , topTenEmployees = topTenEmployees \
        , totalsForYear = totalsForYear)

@app.route('/employee/', methods=['GET'])
def get_employee_by_name():
    salaries = mongo.db.salaries
    first = request.args.get('first')
    last = request.args.get('last')
    return get_documents({'First':first, 'Last':last}, {}, salaries)

@app.route('/cabinet/<cabinet>', methods=['GET'])
def get_employees_by_cabinet(cabinet):
    cabinet = cabinet.upper()
    salaries = mongo.db.salaries
    sums = get_aggregate_by_year({'Cabinet':cabinet}, salaries, "sum")
    avgs = get_aggregate_by_year({'Cabinet':cabinet}, salaries, "avg")
    injuries = get_count_by_year({"Cabinet":cabinet}, salaries, "Injury")
    numEmployees = get_count_by_year({"Cabinet":cabinet}, salaries, "Total")
    allYears = get_all_years({"Cabinet":cabinet}, salaries)
    topTenEmployees = get_top_n_by_year({"Cabinet":cabinet}, salaries, allYears, "Total", 10)
    totalsForYear = get_totals_by_year({"Cabinet":cabinet}, salaries, allYears)

    return render_template('cabinets.html' \
        , cabinet = cabinet \
        , sums = sums \
        , avgs = avgs \
        , injuries=injuries \
        , numEmployees = numEmployees \
        , allYears = allYears \
        , topTenEmployees=topTenEmployees \
        , totalsForYear = totalsForYear)

@app.route('/department/<dept>', methods=['GET'])
def get_employees_by_department(dept):
    dept = dept.upper()
    salaries = mongo.db.salaries
    sums = get_aggregate_by_year({'Department':dept}, salaries, "sum")
    avgs = get_aggregate_by_year({'Department':dept}, salaries, "avg")
    injuries = get_count_by_year({"Department": dept}, salaries, "Injury")
    numEmployees = get_count_by_year({"Department": dept}, salaries, "Total")
    allYears = get_all_years({"Department":dept}, salaries)
    topTenEmployees = get_top_n_by_year({"Department":dept}, salaries, allYears, "Total", 10)
    totalsForYear = get_totals_by_year({"Department":dept}, salaries, allYears)

    return render_template('departments.html' \
        , dept = dept \
        , sums = sums \
        , avgs = avgs \
        , injuries=injuries \
        , numEmployees = numEmployees \
        , allYears = allYears \
        , topTenEmployees=topTenEmployees \
        , totalsForYear = totalsForYear)

@app.route('/department/<dept>/program/<program>', methods=['GET'])
def get_employees_by_program(dept, program):
    program = program.upper()
    salaries = mongo.db.salaries
    sums = get_aggregate_by_year({"$and" : [{'Department':dept},{'Program':program}]}, salaries, "sum")
    avgs = get_aggregate_by_year({"$and" : [{'Department':dept},{'Program':program}]}, salaries, "avg")
    injuries = get_count_by_year({"$and" : [{'Department':dept},{'Program':program}]}, salaries, "Injury")
    numEmployees = get_count_by_year({"$and" : [{'Department':dept},{'Program':program}]}, salaries, "Total")
    allYears = get_all_years({"$and" : [{'Department':dept},{'Program':program}]}, salaries)
    topTenEmployees = get_top_n_by_year({"$and" : [{'Department':dept},{'Program':program}]}, salaries, allYears, "Total", 10)
    totalsForYear = get_totals_by_year({"$and" : [{'Department':dept},{'Program':program}]}, salaries, allYears)
    return render_template('programs.html' \
        , program = program \
        , dept = dept \
        , sums = sums \
        , avgs = avgs \
        , injuries=injuries \
        , numEmployees = numEmployees \
        , allYears = allYears \
        , topTenEmployees=topTenEmployees \
        , totalsForYear = totalsForYear)
        

if __name__ == '__main__':
    app.run(debug=True)


