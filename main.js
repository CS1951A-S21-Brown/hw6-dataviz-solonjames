// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = { top: 40, right: 100, bottom: 40, left: 175 };

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = MAX_WIDTH, graph_1_height = 400;
let graph_2_width = MAX_WIDTH, graph_2_height = 400;
let graph_3_width = MAX_WIDTH, graph_3_height = 400;

//graph 1

//add at body
let svg = d3.select("body")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
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
        console.log(data.map(x => x.Name + ": " + x.Platform));
        y.domain(data.map(x => x.Name + ": " + x.Platform));

        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));
        let bars = svg.selectAll("rect").data(data);


        let color = d3.scaleOrdinal()
            .domain(data.map(function (d) { return d.Name + ": " + d.Platform }))
            .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), 10));

        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("x", x(0))
            .attr("y", (d) => y(d.Name + ": " + d.Platform))
            .attr("fill", function (d) { return color(d.Name + ": " + d.Platform) })
            .attr("width", (d) => x(d.Global_Sales))
            .attr("height", y.bandwidth());

        let counts = countRef.selectAll("text").data(data);

        counts.enter()
            .append("text")
            .merge(counts)
            .transition()
            .duration(1000)
            .attr("x", (d) => x(d.Global_Sales) + 5)
            .attr("y", (d) => y(d.Name + ": " + d.Platform) + 11)
            .style("text-anchor", "start")
            .text((d) => d.Global_Sales);

        if (allTime) {
            title.text("Top Selling Video Games of All Time");
        } else {
            title.text("Top Selling Video Games of " + yearInterested);
        }

    });
}

//graph 2 Map with region data displayed overhead
let svg2 = d3.select("body")
    .append("svg")
    .attr("width", graph_2_width)
    .attr("height", graph_2_height)

let title2 = svg2.append("text")
    .attr("transform", "translate(250, 30)")
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .text("Best Selling Video Game Genere by Region")

var projection = d3.geoNaturalEarth()
    .scale((graph_2_width - 750) / 1.3 / Math.PI)
    .translate([graph_2_width / 2, graph_2_height / 2]);




Promise.all([d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"), d3.csv("../data/video_games.csv")]).then(([data, data2]) => {
    const regionNA = new Set(["USA", "CAN", "MEX"]);
    const regionEU = new Set(["AUT", "BEL", "BGR", "HRV", "CYP", "CZE", "DNK", "EST", "FIN", "FRA", "DEU", "GRC", "HUN", "IRL", "ITA", "LVA", "LTU", "LUX", "MLT", "NLD", "POL", "PRT", "ROU", "SVK", "SVN", "ESP", "SWE"]);
    const regionJP = new Set(["JPN"]);

    const getMaxGenre = (refData, region) => d3.least(d3.rollup(refData, v => d3.sum(v, d => d[region + "_Sales"]), d => d.Genre), ([, sum]) => -sum)[0]

    const genreToColorMap = {
        "Action": "#f54242",
        "Role-Playing": "#4287f5"
    }
    console.log(getMaxGenre(data2, "JP"));
    console.log(genreToColorMap[getMaxGenre(data2, "JP")]);
    const beepBoop100k = svg2.append("g")
        .selectAll("path");
    const colorRegion = (region, color) => beepBoop100k
        .data(data.features.filter((x) => (region === undefined && !regionEU.has(x.id) && !regionNA.has(x.id) && !regionJP.has(x.id)) || (region !== undefined && region.has(x.id))))
        .enter().append("path")
        .attr("fill", color)
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("stroke", "#fff");
    colorRegion(regionNA, genreToColorMap[getMaxGenre(data2, "NA")]);
    colorRegion(regionEU, genreToColorMap[getMaxGenre(data2, "EU")]);
    colorRegion(regionJP, genreToColorMap[getMaxGenre(data2, "JP")]);
    colorRegion(undefined, genreToColorMap[getMaxGenre(data2, "Other")]);
});


// graph 3
let svg3 = d3.select("body")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", "translate(200, 40)");

var x3 = d3.scaleLinear()
    .range([40, 400]);

var y3 = d3.scaleBand()
    .range([50, 500])
    .padding(0.1);

let countRef3 = svg.append("g");
let y_axis_label3 = svg.append("g");

//set up x label
svg3.append("text")
    .attr("transform", "translate(100, 200)")
    .style("text-anchor", "middle")
    .text("Global Sales");

//set up y label
let y_axis_text3 = svg3.append("text")
    .attr("transform", "translate(-90, 15)")
    .style("text-anchor", "middle")
    .text("Game Name");

//set up title
let title3 = svg3.append("text")
    .attr("transform", "translate(150, 15)")
    .style("text-anchor", "middle")
    .style("font-size", 15);

d3.csv("../data/video_games.csv").then(function (data3) {
    data3 = cleanDataByGenre(data3);
    console.log(data3)

    x3.domain([0, d3.max(data3, ([, d]) => parseFloat(d))]);

    const genreList = new Set();
    data3.forEach((y, x) => genreList.add(x.split("///")[0]));

    const publisherList = new Set();
    data3.forEach((y, x) => genreList.add(x.split("///")[1]));

    let colorPublisher = d3.scaleOrdinal()
        .domain([...publisherList])
        .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), 100));

    y3.domain([...genreList]);

    console.log(y3("Sports"))

    svg3.append('g')
        .selectAll("dot")
        .data(data3)
        .enter()
        .append("circle")
        .attr("cx", function ([, d]) { return x3(parseFloat(d)); })
        .attr("cy", function ([d,]) { return (y3(d.split("///")[0]) - 50) * 300 / 11 })
        .attr("r", 4)
        .style("fill", function ([d,]) { return colorPublisher(d.split("///")[1]) })

});



function cleanDataByYear(data, allTime, yearInterested) {
    if (allTime) {
        return data.sort((a, b) => b.Global_Sales - a.Global_Sales).slice(0, 10)
    } else {
        return data.filter((d) => d.Year == yearInterested).sort((a, b) => b.Global_Sales - a.Global_Sales).slice(0, 10)
    }
}

function cleanDataByGenre(data) {
    return d3.rollup(data, v => d3.sum(v, d => d["Global_Sales"]), d => (d.Genre + "///" + d.Publisher));
}