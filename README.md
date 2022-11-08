# BostonSalaries 
Welcome to my project! This interactive web app allows users to query data and see interesting visualizations about Boston City Employee pay, with the goal of promoting transparency.

It's built on Python, Flask, Pandas, NumPy, JavaScript, D3.js, HTML, and MongoDB.
Data is sourced from Boston's Open Data Portal: https://data.boston.gov/dataset/employee-earnings-report

Link to the production app (hosted on MongoDB Atlas and Heroku): https://city-employee-salaries.herokuapp.com/

Note: Heroku has a 30 second limit before the application will time out. The landing page has data for all Boston employees, so it can be slow and sometime pass the 30 second threshold, causing a failure. 
If the application fails to load, try again later, or try filtering for a specific department, 
e.g. https://city-employee-salaries.herokuapp.com/department/police%20department. I will try to speed up the initial query soon!
