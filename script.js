
const jsonurl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'

const WIDTH = 2800;
const HEIGHT = 800;
const PADX = 75;
const PADY = 50;

const chart = {
  w: WIDTH - 2 * PADX,
  h: HEIGHT - 2 * PADY,
  origin: { x: PADX, y: HEIGHT - PADY},
  max: { x: WIDTH - PADX, y: PADY}
};

const colors = ['royalblue', 'cornflowerblue', '#B5A0CA', '#DCBFBC', '#FFDEAD', '#F0B287', '#DE8663', 'indianred', 'firebrick']

const legend = {
  w: 100,
  h: 50 * colors.length + 40,
  boxw: 50,
  pad: 20,
}

const months = [...Array(12).keys()]
const formatMonth = d3.timeFormat('%B')

const yScale = d3.scaleBand()
  .domain(months)
  .range([0, chart.h])

const svg = d3.select('#chartwrap')
  .append('svg')
  .attr('id','chart')
  .attr('width', WIDTH)
  .attr('height', HEIGHT)
  .style('background-color','#202020')

const tooltip = d3.select('#chartwrap')
  .append('div')
  .attr('id','tooltip')

const svglegend = d3.select('#legendbox')
  .append('svg')
  .attr('id','legend')
  .attr('height', legend.h)
  .attr('width', legend.w)
  .style('background-color','#202020')

const yAxis = d3.axisLeft(yScale)
  .tickFormat(d => formatMonth(new Date(0, d)))

svg.append('g')
  .attr('id','y-axis')
  .attr('transform','translate(' + PADX + ',' + PADY + ')')
  .call(yAxis)

d3.json(jsonurl)
  .then(ref => {

    const baseTemp = ref.baseTemperature + 273.15;
    const variance = ref.monthlyVariance.map(d => d.variance);
    const years = ref.monthlyVariance.map(d => d.year);
    const yearSet = [...new Set(years)];

    const xScale = d3.scaleBand()
      .range([0, chart.w])
      .domain(yearSet);

    const xAxis = d3.axisBottom(xScale)
      .tickValues(yearSet.filter(d => d % 10 == 0));

    const colorScale = d3.scaleQuantize()
      .domain([-7, 7])
      .range(colors)

    const legendScale = d3.scaleLinear()
      .domain([-7, 7])
      .range([0, legend.h - 40])

    const legendAxis = d3.axisRight(legendScale)
      .tickValues([-7,...colorScale.thresholds(), 7])

    svg.append('g')
      .attr('id','x-axis')
      .attr('transform',`translate(${PADX},${chart.origin.y})`)
      .call(xAxis);

    svg.selectAll('rect')
      .data(ref.monthlyVariance)
      .enter()
      .append('rect')
      .attr('class','cell')
      .attr('width', chart.w / yearSet.length)
      .attr('height', chart.h / 12)
      .attr('x', d => xScale(d.year) + PADX)
      .attr('y', d => yScale(d.month - 1) + PADY)
      .attr('data-month', d => d.month - 1)
      .attr('data-year', d => d.year)
      .attr('data-temp', d => baseTemp + d.variance)
      .attr('fill', d => colorScale(d.variance))
      .on('mouseover', (event, d) => {

        d3.select('#tooltip')
          .attr('data-year', d.year)
          .style('left', (event.pageX + 20)+ 'px')
          .style('top', (event.pageY - 40) + 'px')
          .style('opacity', .9)
          .style('color', colorScale(d.variance))
          .html(`
              <p>${formatMonth(new Date(0, d.month - 1))} ${d.year}</p>
              <h2>${(d.variance + (baseTemp)).toFixed(3)} K</h1>
              <h4>${d.variance > 0 ? '+' + d.variance : d.variance}</h4>
          `)

      })


      .on('mouseout', (event, d) => {
        
        tooltip
          .style('opacity', 0)

      });

    svglegend.selectAll('rect')
      .data(colors)
      .enter()
      .append('rect')
      .attr('class','colorbox')
      .attr('width', legend.boxw)
      .attr('height', legend.boxw)
      .attr('x', legend.pad)
      .attr('y', (d, i) => i * legend.boxw + legend.pad)
      .attr('fill', d => d)

    svglegend.append('g')
      .attr('id','legend-axis')
      .attr('transform',`translate(${legend.pad + legend.boxw}, ${legend.pad})`)
      .call(legendAxis)

    svglegend.append('text')
      .attr('id', 'lgnd-lbl')
      .attr('fill','grey')
      .attr('transform','translate(10, 200) rotate(-90)')
      .text('Thermal Anomoly (K)')


    
  });


