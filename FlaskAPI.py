from flask import Flask, jsonify, request
from flask_pymongo import PyMongo

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

app.config['MONGO_DBNAME'] = 'boston_salaries'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/boston_salaries'

mongo = PyMongo(app)

@app.route('/employee/', methods=['GET'])
def get_employee_by_name():
    salaries = mongo.db.salaries
    first = request.args.get('first')
    last = request.args.get('last')
    employee = [doc for doc in salaries.find({'First':first, 'Last':last}, {'_id': False})]
    if employee:
        output = jsonify(data=employee)
    else:
        output = 'No employee found.'
    return output

@app.route('/employees/<cabinet>', methods=['GET'])
def get_employees_by_cabinet(cabinet):
    salaries = mongo.db.salaries
    #cabinet=request.args.get('cabinet')
    employees = [doc for doc in salaries.find({'Cabinet':cabinet}, {'_id': False})]
    if employees:
        output = jsonify(employees)
    else:
        output = 'No employee found.'
    return output


if __name__ == '__main__':
    app.run(debug=True)


