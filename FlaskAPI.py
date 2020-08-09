from flask import Flask, jsonify, request, render_template
from flask_pymongo import PyMongo
import simplejson as json

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

app.config['MONGO_DBNAME'] = 'boston_salaries'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/boston_salaries'

mongo = PyMongo(app)

#helper method for API routes
def get_documents(dic, db):
    docs = [doc for doc in db.find(dic, {'_id' : False})]
    if docs:
        output = docs
        #output=jsonify(docs)
    else:
        output = 'No results found.'
    return render_template('index.html', output=output)

def get_aggregate(dic, db, agg, org):
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
    output = docs
    return render_template('index.html', output=output, agg=agg, org=org)
    

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/employee/', methods=['GET'])
def get_employee_by_name():
    salaries = mongo.db.salaries
    first = request.args.get('first')
    last = request.args.get('last')
    return get_documents({'First':first, 'Last':last}, salaries)

@app.route('/cabinet/<cabinet>', methods=['GET'])
def get_employees_by_cabinet(cabinet):
    salaries = mongo.db.salaries
    return get_aggregate({'Cabinet':cabinet}, salaries, "sum", cabinet)

@app.route('/department/<dept>', methods=['GET'])
def get_employees_by_department(dept):
    salaries = mongo.db.salaries
    return get_aggregate({'Department':dept}, salaries, "sum", dept)

@app.route('/department/<dept>/program/<program>', methods=['GET'])
def get_employees_by_program(dept, program):
    salaries = mongo.db.salaries
    return get_aggregate({"$and" : [{'Department':dept},{'Program':program}]}, salaries, "sum", program)

if __name__ == '__main__':
    app.run(debug=True)


