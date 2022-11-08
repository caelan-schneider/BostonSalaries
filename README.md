# BostonSalaries 
Welcome to my project! This interactive web app allows users to query data and see interesting visualizations about Boston City Employee pay, with the goal of promoting transparency.

It's built on Python, Flask, Pandas, NumPy, JavaScript, D3.js, HTML, and MongoDB.
Data is sourced from Boston's Open Data Portal: https://data.boston.gov/dataset/employee-earnings-report

Link to the production app (hosted on MongoDB Atlas and Heroku): https://city-employee-salaries.herokuapp.com/

Note: If the application fails to load, try filtering for a specific department, e.g. https://city-employee-salaries.herokuapp.com/department/police%20department. 
The initial landing page sometimes times out because it's querying data for the whole city.

TODO:
* Implement caching for landing page query.
* Automate data load / transformation by migrating to a prefect pipeline.
* Add more interactivity to existing widgets.
* Add data for total department expenses, so user can see percentage of spend that is employee salaries.
* Add time series widget on landing page to compare departments.
* Create new heat map widget using zip-code data so user can see the most common areas employees live.
