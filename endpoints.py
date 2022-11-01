from flask import Flask, jsonify, request, render_template
from utils import MongoCollection

app = Flask(__name__)
common_pivots = ["Regular", "Retro", "Overtime", "Injury", "Other", "Total"]
salaries = MongoCollection(app, db_name="boston_salaries", collection_name="salaries")


@app.route('/')
def display_all(): 
    sums_by_year = salaries.pivot({}, agg="sum", group_by="Year", pivot_on=common_pivots)
    avgs_by_year = salaries.pivot({}, agg="avg", group_by="Year", pivot_on=common_pivots)
    injured_employees_by_year = salaries.count_instance_of_field({}, field="Injury", group_by="Year")
    employees_by_year = salaries.count_instance_of_field({}, field="Total", group_by="Year")
    years = salaries.unique_values({}, field="Year", is_desc=True)
    
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
    return jsonify(salaries.get_documents({'First':first, 'Last':last}, projection={}))


@app.route('/top-n-for-year', methods=['GET'])
def top_n_employees_json():
    year = int(request.args.get("forYear", None))
    page_type = request.args.get("pageType", None).title()
    value = request.args.get("value", None)
    if page_type: 
        return {"data": salaries.top_n({"$and": [{"Year": year}, {page_type: value}]}, "Total", n=10)}
    return {"data": salaries.top_n({"Year": year}, "Total", n=10)}


@app.route('/salary-histogram', methods=['GET'])
def salary_histogram_json():
    year = int(request.args.get("forYear", None))
    page_type = request.args.get("pageType", None).title()
    value = request.args.get("value", None)
    if page_type: 
        return {"data": salaries.histogram({"$and": [{"Year": year}, {page_type : value}]}, "Total")}
    return {"data" :salaries.histogram({"Year": year}, "Total")}


@app.route('/division-options', methods=['GET'])
def division_options_json():
    selected = request.args.get("selected", None)
    if selected == "Program":
        return {"options": [k["Department"] + " - " + k["Program"] for k in salaries.unique_dim_pairs("Department", "Program")]}
    if selected not in ("Department", "Cabinet"):
        return {"options":[]}
    return {"options":salaries.unique_values({}, selected)}


@app.route('/cabinet/<cabinet>', methods=['GET'])
def display_employees_by_cabinet(cabinet):
    cabinet = cabinet.upper()
    value = cabinet
    sums_by_year = salaries.pivot({'Cabinet': cabinet}, "sum", "Year", common_pivots)
    avgs_by_year = salaries.pivot({'Cabinet': cabinet}, "avg", "Year", common_pivots)
    injured_employees_by_year = salaries.count_instance_of_field({"Cabinet": cabinet}, "Injury", "Year")
    employees_by_year =salaries.count_instance_of_field({"Cabinet": cabinet}, "Total", "Year")
    years = salaries.unique_values({'Cabinet': cabinet}, "Year", is_desc=True)

    return render_template('index.html' \
        , path_root = "http://localhost:5000/" \
        , page_type = "cabinet" \
        , value = value \
        , sums_by_year = sums_by_year \
        , avgs_by_year = avgs_by_year \
        , injured_employees_by_year = injured_employees_by_year \
        , employees_by_year = employees_by_year \
        , years = years)


@app.route('/department/<dept>', methods=['GET'])
def display_employees_by_department(dept):
    dept = dept.upper()
    value = dept
    sums_by_year = salaries.pivot({'Department':dept}, "sum", "Year", common_pivots)
    avgs_by_year = salaries.pivot({'Department':dept}, "avg", "Year", common_pivots)
    injured_employees_by_year = salaries.count_instance_of_field({"Department": dept}, "Injury", "Year")
    employees_by_year =salaries.count_instance_of_field({"Department": dept}, "Total", "Year")
    years = salaries.unique_values({'Department':dept}, "Year", is_desc=True)

    return render_template('index.html' \
        , path_root = "http://localhost:5000/" \
            
        , page_type = "department" \
        , value = value \
        , sums_by_year = sums_by_year \
        , avgs_by_year = avgs_by_year \
        , injured_employees_by_year = injured_employees_by_year \
        , employees_by_year = employees_by_year \
        , years = years)



@app.route('/department/<dept>/program/<program>', methods=['GET'])
def display_employees_by_program(dept, program):
    dept = dept.upper()
    program = program.upper()
    value = program 
    sums_by_year = salaries.pivot({"$and" : [{'Department':dept},{'Program':program}]}, "sum", "Year", common_pivots)
    avgs_by_year = salaries.pivot({"$and" : [{'Department':dept},{'Program':program}]}, "avg", "Year", common_pivots)
    injured_employees_by_year = salaries.count_instance_of_field({'Department':dept, 'Program':program}, "Injury", "Year")
    employees_by_year = salaries.count_instance_of_field({'Department':dept, 'Program':program}, "Total", "Year")
    years = salaries.unique_values({"$and" : [{'Department':dept},{'Program':program}]}, "Year", is_desc=True)

    return render_template('index.html' \
        , path_root = "http://localhost:5000/" \
        , page_type = "program" \
        , value = value \
        , dept = dept \
        , sums_by_year = sums_by_year \
        , avgs_by_year = avgs_by_year \
        , injured_employees_by_year = injured_employees_by_year \
        , employees_by_year = employees_by_year \
        , years = years)
        

if __name__ == '__main__':
    app.run(debug=True)


