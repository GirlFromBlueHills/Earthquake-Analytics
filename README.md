####Project name: Earthquake Analytics -- Visualizing the Earthquake data by D3.js
####Team members: Jinfa Zhao (jzhao30) Jiaqi Duan (jduan4)
####Email: Jinfa: jzhao30@dons.usfca.edu ; Jiaqi: jduan4@dons.usfca.edu
####Project website: https://comefar.github.io/Earthquake-Analytics/EarthquakeOverview.html

##Overview:
This Visualization shows the earthquakes happened in the world and relationship between fracking and earthquake in the U.S.This visualization provide many user interactive functions, such as search query, crossfilter, tooltip, zoom, and scatter plot to analyze the specific data. The first page shows the overview of earthquakes. The second page shows the relationship between earthquake and fracking. This project can make a great impact. First, it improve earthquake monitoring. Second, the interactive visualization help common people get more understanding on earthquake. Third, it may help scientist study the pattern of earthquakes and predict earthquakes happening. Fourth, it may help scientist find out if the human activities would trigger seismic activity.

##Project Structure:
CSS folder contains all css files in the project.
CSV folder contains earthquake.csv which is earthquake data in the world and earthquake_usa.csv which is earthquake data in USA and fracking.csv is fracking data, fracking_clean is the fracking data without the missing tuples, world-110m-country-names.tsv is the cities around the world.
Js folder contains all javascript files used in the project, including earthquakeOverview.js,fracking_vs_earthquakes.js, crossfilterBarChart.js. We use some libraries including bootstrap.js, crossfilter.js, dc.js and d3.js.
Json folder contains the map data for the project.
EarthquakeOverview.html is the first html page of the project and fracking_vs_earthquakes.html is the second html page.
Datacleaning folder contains some python scripts we used to clean data.
Doc folder contains the related documents.

##Non-obvious features:
For the earthquake overview page:
(1)User can click “Play Or Stop” to play and pause the rotation animation.
(2)User can click one of the countries on the map then the projection will change.

For the fracking vs earthquake:
(1)Zoom in zoom out
(2)select the range of bar chart or line chart to do the crossfilter.
