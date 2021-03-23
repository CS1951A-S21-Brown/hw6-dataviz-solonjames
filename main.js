// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = { top: 40, right: 100, bottom: 40, left: 175 };

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

//graph 1

//add at body
let svg = d3.select("body")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_2_height)
    .append("g")
    .attr("transform", "translate(200, 40)");

//set up dynamic x axis
let x = d3.scaleLinear()
    .range([0, graph_1_width - margin.left - margin.right]);

//set up dynamic y axis
let y = d3.scaleBand()
    .range([margin.top, graph_1_height - margin.top - margin.bottom])
    .padding(0.1);

let countRef = svg.append("g");
let y_axis_label = svg.append("g");

//set up x label
svg.append("text")
    .attr("transform", "translate(100, 200)")
    .style("text-anchor", "middle")
    .text("Global Sales");

//set up y label
let y_axis_text = svg.append("text")
    .attr("transform", "translate(-90, 15)")
    .style("text-anchor", "middle")
    .text("Game Name");

//set up title
let title = svg.append("text")
    .attr("transform", "translate(150, 15)")
    .style("text-anchor", "middle")
    .style("font-size", 15);

setData(true)
function setData(allTime) {
    d3.csv("../data/video_games.csv").then(function (data) {
        if (allTime) {
            var yearInterested = 2006;
        } else {
            var yearInterested = document.getElementById('Year').value;
        }
        data = cleanDataByYear(data, allTime, yearInterested)

        //set x domain
        x.domain([0, d3.max(data, (d) => parseFloat(d.Global_Sales))]);

        //set y domain
        y.domain(data.map(x => x.Name));

        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));
        let bars = svg.selectAll("rect").data(data);


        let color = d3.scaleOrdinal()
            .domain(data.map(function (d) { return d.Name }))
            .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), 10));

        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("x", x(0))
            .attr("y", (d) => y(d.Name))
            .attr("fill", function (d) { return color(d.Name) })
            .attr("width", (d) => x(d.Global_Sales))
            .attr("height", y.bandwidth());

        let counts = countRef.selectAll("text").data(data);

        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .attr("x", (d) => x(d.Global_Sales) + 5)
            .attr("y", (d) => y(d.Name) + 11)
            .style("text-anchor", "start")
            .text((d) => d.Global_Sales);

        if (allTime) {
            title.text("Top Selling Video Games of All Time");
        } else {
            title.text("Top Selling Video Games of " + yearInterested);
        }

    });
}

function cleanDataByYear(data, allTime, yearInterested) {
    if (allTime) {
        return data.sort((a, b) => b.Global_Sales - a.Global_Sales).slice(0, 10)
    } else {
        return data.filter((d) => d.Year == yearInterested).sort((a, b) => b.Global_Sales - a.Global_Sales).slice(0, 10)
    }
}