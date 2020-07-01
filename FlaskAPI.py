from flask import Flask, jsonify, request
from flask_pymongo import PyMongo

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

app.config['MONGO_DBNAME'] = 'boston_salaries'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/boston_salaries'

mongo = PyMongo(app)

@app.route('/employee/', methods=['GET'])
def get_one_employee():
    salaries = mongo.db.salaries
    first = request.args.get('first')
    last = request.args.get('last')
    employee = [doc for doc in salaries.find({'First':first, 'Last':last}, {'_id': False})]
    if employee:
        output = jsonify(data=employee)
    else:
        output = 'Employee not found.'
    return output

if __name__ == '__main__':
    app.run(debug=True)


