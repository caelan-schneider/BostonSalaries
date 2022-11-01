from flask import Flask, jsonify, request, render_template
from utils import MongoCollection

app = Flask(__name__)
common_pivots = ["Regular", "Retro", "Overtime", "Injury", "Other", "Total"]
salaries = MongoCollection(app, db_name="boston_salaries", collection_name="salaries")


@app.route('/')
def display_all(): 
    sums_by_year = salaries.pivot(filter={}, agg="sum", group_by="Year", pivot_on=common_pivots)
    avgs_by_year = salaries.pivot(filter={}, agg="avg", group_by="Year", pivot_on=common_pivots)
    injured_employees_by_year = salaries.count_instance_of_field(filter={}, field="Injury", group_by="Year")
    employees_by_year = salaries.count_instance_of_field(filter={}, field="Total", group_by="Year")
    years = salaries.unique_values(filter={}, field="Year", is_desc=True)
    
    return render_template('index.html' \
        , path_root = "http://localhost:5000/" \
        , sums_by_year = sums_by_year \
        , avgs_by_year = avgs_by_year \
        , injured_employees_by_year = injured_employees_by_year \
        , employees_by_year = employees_by_year \
        , years = years)


@app.route('/employee/', methods=['GET'])
def employee_by_name_json():
    first = request.args.get('first')
    last = request.args.get('last')
    return jsonify(salaries.get_documents(filter={'First':first, 'Last':last}, projection={}))


@app.route('/top-n-for-year', methods=['GET'])
def top_n_employees_json():
    year = int(request.args.get("forYear", None))
    division_type = request.args.get("divisionType", None).title()
    division_value = request.args.get("divisionValue", None)
    if division_type: 
        return {"data": salaries.top_n(filter={"$and": [{"Year": year}, {division_type: division_value}]}, sort_on="Total", n=10)}
    return {"data": salaries.top_n(filter={"Year": year}, sort_on="Total", n=10)}


@app.route('/salary-histogram', methods=['GET'])
def salary_histogram_json():
    year = int(request.args.get("forYear", None))
    division_type = request.args.get("divisionType", None).title()
    division_value = request.args.get("divisionValue", None)
    if division_type: 
        return {"data": salaries.histogram(filter={"$and": [{"Year": year}, {division_type : division_value}]}, field="Total")}
    return {"data" :salaries.histogram(filter={"Year": year}, field="Total")}


@app.route('/division-options', methods=['GET'])
def division_options_json():
    selected = request.args.get("selected", None)
    if selected == "Program":
        return {"options": [k["Department"] + " - " + k["Program"] for k in salaries.unique_dim_pairs("Department", "Program")]}
    if selected in ("Department", "Cabinet"):
        return {"options":salaries.unique_values(filter={}, field=selected)}
    return {"options":[]}


@app.route('/cabinet/<cabinet>', methods=['GET'])
def display_employees_by_cabinet(cabinet):
    cabinet = cabinet.upper()
    sums_by_year = salaries.pivot(filter={'Cabinet': cabinet}, agg="sum", group_by="Year", pivot_on=common_pivots)
    avgs_by_year = salaries.pivot(filter={'Cabinet': cabinet}, agg="avg", group_by="Year", pivot_on=common_pivots)
    injured_employees_by_year = salaries.count_instance_of_field(filter={"Cabinet": cabinet}, field="Injury", group_by="Year")
    employees_by_year =salaries.count_instance_of_field(filter={"Cabinet": cabinet}, field="Total", group_by="Year")
    years = salaries.unique_values(filter={'Cabinet': cabinet}, field="Year", is_desc=True)

    return render_template('index.html' \
        , path_root = "http://localhost:5000/" \
        , division_type = "cabinet" \
        , division_value = cabinet \
        , sums_by_year = sums_by_year \
        , avgs_by_year = avgs_by_year \
        , injured_employees_by_year = injured_employees_by_year \
        , employees_by_year = employees_by_year \
        , years = years)


@app.route('/department/<dept>', methods=['GET'])
def display_employees_by_department(dept):
    dept = dept.upper()
    sums_by_year = salaries.pivot(filter={'Department':dept}, agg="sum", group_by="Year", pivot_on=common_pivots)
    avgs_by_year = salaries.pivot(filter={'Department':dept}, agg="avg", group_by="Year", pivot_on=common_pivots)
    injured_employees_by_year = salaries.count_instance_of_field(filter={"Department": dept}, field="Injury", group_by="Year")
    employees_by_year =salaries.count_instance_of_field(filter={"Department": dept}, field="Total", group_by="Year")
    years = salaries.unique_values(filter={'Department':dept}, field="Year", is_desc=True)

    return render_template('index.html' \
        , path_root = "http://localhost:5000/" \
            
        , division_type = "department" \
        , division_value = dept \
        , sums_by_year = sums_by_year \
        , avgs_by_year = avgs_by_year \
        , injured_employees_by_year = injured_employees_by_year \
        , employees_by_year = employees_by_year \
        , years = years)



@app.route('/department/<dept>/program/<program>', methods=['GET'])
def display_employees_by_program(dept, program):
    dept = dept.upper()
    program = program.upper()
    sums_by_year = salaries.pivot(filter={"$and" : [{'Department':dept},{'Program':program}]}, agg="sum", group_by="Year", pivot_on=common_pivots)
    avgs_by_year = salaries.pivot(filter={"$and" : [{'Department':dept},{'Program':program}]}, agg="avg", group_by="Year", pivot_on=common_pivots)
    injured_employees_by_year = salaries.count_instance_of_field(filter={'Department':dept, 'Program':program}, field="Injury", group_by="Year")
    employees_by_year = salaries.count_instance_of_field(filter={'Department':dept, 'Program':program}, field="Total", group_by="Year")
    years = salaries.unique_values(filter={"$and" : [{'Department':dept},{'Program':program}]}, field="Year", is_desc=True)

    return render_template('index.html' \
        , path_root = "http://localhost:5000/" \
        , division_type = "program" \
        , division_value = program \
        , dept = dept \
        , sums_by_year = sums_by_year \
        , avgs_by_year = avgs_by_year \
        , injured_employees_by_year = injured_employees_by_year \
        , employees_by_year = employees_by_year \
        , years = years)
        

if __name__ == '__main__':
    app.run(debug=True)


