const dimension_order = [
    'Appearance Aspirations',
    'Continuous Learning',
    'Cultural Exploration',
    'Cultural Identity Connection',
    'Environmentalism',
    'Family Orientation',
    'Financial Optimism',
    'Health Commitment',
    'Natural Preferences',
    'Novelty Aspirations',
    'Religiosity',
    'Tech Disposition',
]

let annotation_color_main = '#35C0CA' //'#E5007E'
let annotation_color_secondary = '#EB6728' //'#E5007E'

const pi1_2 = Math.PI / 2
const pi = Math.PI
const pi2 = Math.PI * 2

///////////////////////// Set-up containers /////////////////////////

let width = 1920 * 0.65
let height = 1080

const canvas = d3.select('#chart').append('canvas').attr('id', 'canvas-base')
const ctx = canvas.node().getContext('2d')
crispyCanvas(canvas, ctx, width, height)

const canvas_heatmap = d3.select('#chart').append('canvas').attr('id', 'canvas-heatmap')
const ctx_heatmap = canvas_heatmap.node().getContext('2d')
crispyCanvas(canvas_heatmap, ctx_heatmap, width, height)

const svg = d3.select('#chart').append('svg')
    .attr('width', width)
    .attr('height', height)

//Create groups
const rect_group = svg.append('g')
    .attr('class', 'rect-group')

const state_group = svg.append('g')
    .attr('class', 'state-group')

const legend_group = svg.append('g')
    .attr('class', 'legend-group')
    .style('opacity', 0)

const contour_group = svg.append('g')
    .attr('class', 'contour-group')
    .attr('transform', `scale(1,-1)translate(0,${-height})` )

const annotation_group = svg.append('g')
    .attr('class', 'annotation-group')

const title_group = svg.append('g')
    .attr('class', 'title-group')
    .style('pointer-events','none')

///////////////////////// Set-up projection /////////////////////////
//Based on https://www.safaribooksonline.com/library/view/svg-essentials/0596002238/ch05s06.html
let center_map = [width/2 - 960/2, height/2 - 600/2]
let scale_map = 1.1
//Used comment on https://gist.github.com/mbostock/4122298
//https://github.com/d3/d3-geo/blob/master/README.md#geoIdentity
const projection = d3.geoIdentity() //d3.geoAlbersUsa()
    .translate([center_map[0] - 960/2*(scale_map-1), center_map[1] - 600/2*(scale_map-1)]) //[width/2, height/2]
    .scale(scale_map) //1700

const path = d3.geoPath()
    .projection(projection)
    .context(ctx)

const path_svg = d3.geoPath()
    .projection(projection)

///////////////////////// Set-up scales /////////////////////////

//Heatmap dimensions
const n = 58
const m = 61

//tSNE x scale
const y_range = [height * 0.1, height*(1-0.1)]
const x_range = [width/2 - height/2 + y_range[0], width/2 - height/2 + y_range[1]]
const x_scale = d3.scaleLinear()
    .domain([-29,28])
    .range(x_range)
//tSNE y scale
const y_scale = d3.scaleLinear()
    .domain([31,-29])
    .range(y_range)

//Heatmap color scale
const colors_heatmap = chroma.bezier(['#076776', '#00B6ED', '#93C01F', '#eae414'])
    .scale()
    .colors(10)

const color_heatmap_scale = chroma.scale(colors_heatmap)
    .domain(d3.range(10))
    .mode('lch')
    .correctLightness()
// const color_heatmap_scale = d3.scaleLinear()
//     .domain(d3.range(10))
//     .range(['#0096ae','#179db8','#34a4bb','#52abb4','#6db2a3','#87b985','#9bc064','#abc741','#b8ce21','#c8d400'])

///////////////////////// Set-up the timeline /////////////////////////

//GreenSock timeline
const tl = new TimelineMax({paused: true})
//Set initial values
tl.addLabel('sceneStart')
tl.add(() => ctx.clearRect(0, 0, width, height), 'sceneStart')
tl.set(annotation_group.node(), {opacity: 0}, 'sceneStart')
tl.set(document.getElementById('top-logo-row'), {opacity: 0}, 'sceneStart')
tl.set(document.getElementById('chart-text'), {opacity: 0}, 'sceneStart')

///////////////////////// Create gradients /////////////////////////

const defs = svg.append('defs')

//Create a gradient for the gold stroke gradient of the states
const gradient_gold_states = defs.append('linearGradient')
    .attr('id', 'gold-gradient-states')
    .attr('gradientUnits', 'userSpaceOnUse') 
    .attr('x1', width*0.2).attr('y1', 0)
    .attr('x2', width*0.8).attr('y2', 0)
applyGoldGradient(gradient_gold_states)

const gradient_gold_horizontal = defs.append('linearGradient')
    .attr('id', 'gold-gradient-horizontal')
    .attr('x1', 0).attr('y1', 0)
    .attr('x2', 1).attr('y2', 0)
applyGoldGradient(gradient_gold_horizontal)

//Add stops to the given gradient to create the gold effect
function applyGoldGradient(gradient) {
    gradient.append('stop').attr('offset', '1%').attr('stop-color', 'rgb(242,218,100)')
    gradient.append('stop').attr('offset', '17%').attr('stop-color', 'rgb(162,119,0)')
    gradient.append('stop').attr('offset', '19%').attr('stop-color', 'rgb(162,119,0)')
    gradient.append('stop').attr('offset', '51%').attr('stop-color', 'rgb(242,218,100)')
    gradient.append('stop').attr('offset', '71%').attr('stop-color', 'rgb(215,180,70)')
    gradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgb(152,112,0)')
}//function applyGoldGradient

//Create the gradient for the heatmap legend
const gradient_heatmap = defs.append('linearGradient')
    .attr('id', 'heatmap-gradient-horizontal')
    .attr('x1', 0).attr('y1', 0)
    .attr('x2', 1).attr('y2', 0)

gradient_heatmap.selectAll('stop')
    .data(d3.range(10).map(d => color_heatmap_scale(d).hex()))
    .enter().append('stop')
    .attr('offset', (d,i) => i/(10-1))
    .attr('stop-color', d => d)

///////////////////////// Set-up legend /////////////////////////

legend_group.attr('transform', 'translate(' + [width * 0.7, height * 0.1] + ')')
tl.set(legend_group.node(), {opacity: 0}, 'sceneStart')

//Add the colored rectangle
let l_w = width * 0.25
let l_h = 8
legend_group.append('path')
    .attr('class', 'legend-rect')
    .style('fill', 'url(#heatmap-gradient-horizontal)')
    .attr('d', () => {
        let x_off = 4
        return `M${0},${l_h/2} L${x_off},${0} L${l_w - x_off},${0} L${l_w},${l_h/2} L${l_w - x_off},${l_h} L${x_off},${l_h} Z`
    })

//Add a title above the legend rectangle
legend_group.append('text')
    .attr('class', 'legend-title')
    .attr('x', l_w/2)
    .attr('y', '-2.9em')
    .attr('dy', '0.35em')

function changeLegendTitle(dimension) {
    legend_group.selectAll('.legend-title tspan').remove()
    legend_group.selectAll('.legend-title')
        .text("What percentage of the county's population have a high propensity for " + dimension)
        .call(wrap, width * 0.3, 1.6)
}//function changeLegendTitle

//Add the labels on the outside of the legend's rectangle
legend_group.selectAll('.legend-label')
    .data([{ text: 'few', x: -5, anchor: 'end'}, { text: 'many', x: l_w + 5, anchor: 'start'}])
    .enter().append('text')
    .attr('class', 'legend-label')
    .attr('x', d => d.x)
    .attr('y', l_h/2)
    .attr('dy', '0.35em')
    .style('text-anchor', d => d.anchor)
    .text(d => d.text)

///////////////////////// Set-up other things /////////////////////////

//Size of the diamonds
let diamond = {w: 2, h: 1.4 * 2}
tl.set(diamond, {w: 2, h: 1.4 * 2}, 'sceneStart')

const side_text = d3.select('#chart-text')
const side_text_html = [
    '<p>This is your usual view of the US and the 3000+ counties within it. Everything is where you expect to see it.</p> <p>It makes sense but it doesn’t tell us anything about the counties. It doesn’t tell us about the attitudes within each county. In this view, <b>proximity</b> represents <b>geography</b> and not attitude.</p>',
    '<p><b>MotiveMix</b> identifies where people fall on 12 critical <b>attitudinal dimensions</b> including <i>financial optimism</i> and <i>family orientation</i>. MotiveMix means we can redraw the map to place <i>like</i> next to <i>like</i>.</p>',
    '<p>Using a powerful <b>algorithm</b> that analyzes all U.S. counties across <i>all</i> 12 dimensions, we looked for patterns of similarity and re-located each county accordingly.</p>',
    '<p>This is what the United States looks like if every county were placed <b>nearest</b> to the others with the <b>most similar attitudinal profile</b>.</p> <p>Counties that are farther away from each other have increasingly less in common.</p>',
    '<p>For example, in this view we have highlighted a handful of <b class="annotation-text">counties in the US with over 1,000,000 individuals</b>.</p><p>While each of these counties is in a different state, ranging from New York to California, they are <i>all alike</i> in their representation of MotiveMix dimensions.</p>',
    '<p>We have also plotted a handful of smaller counties, which have <b class="annotation-text">a population of less than 1,000</b>, and you can see in the current view that their representation of MotiveMix dimensions is similar to the representation found in the larger counties of 1,000,000 or more. </p>',
    '<p>MotiveMix can find <b>similarities</b> like these across the vast range of geographies in the U.S. and it can identify the commonalities in motivations between these different areas.</p>',
    '<p>MotiveMix can also highlight the <b>tensions</b> still present in the U.S. and the wide range of attitudes and motivations that drive smaller worlds.</p><p>For example, here is a different selection of small counties in the U.S. with <b class="annotation-text">less than 1,000 individuals</b>.</p><p>Unlike the view of counties that we displayed before, these U.S. counties all represent <b>very different groups of individuals</b>.</p>',
    '<p>Using MotiveMix we are able to examine U.S. geographies and <b>identify pockets with similar attitudinal profiles</b> and areas where these attitudes may differ.</p><p>We can do these analyses for target areas down to the zip code level and we can compare these locations to any other geographies of interest throughout the U.S.</p><p>For example, here are all the counties from <b class="annotation-text">Texas</b></p>',
    '<p>and all counties from <b class="annotation-text">California</b></p>',
    '<p>We can look how these counties feel about <b>Environmentalism</b> in particular, one of the 12 attitudinal MotiveMix dimensions.</p><p>All the counties are now colored by what percentage of the county says they have <b>high propensity</b> for Environmentalism. From a <span style="color: #03869b;">low</span> to a <span style="color: #eae414;">high</span> percentage of the people in a county <span style="color: #8d8d8d;">— relative to all other counties.</span></p>',
    '<p>To make it easier to interpret, we can interpolate these values into a <b>heatmap</b> of Environmentalism. This gives us insights into the exact attitudinal hallmarks of each area in the grid.</p> <p>For example, this heatmap helps us to understand that <b>environmental concerns</b> bind together the counties clustered on the <span style="color: #eae414;">upper-left side.</span></p>',
    '<p>We can do this with any of the MotiveMix attitudinal dimensions allowing us to take many, many different views of the US. Such as...</p>',
    '<p>Kantar Consulting can use MotiveMix and a range of other tools to help you <i>see</i> America differently.</p>',
]
tl.add(() => side_text.html(side_text_html[0]), 'sceneStart')

///////////////////////// Read in data /////////////////////////

let promises = []
// promises.push(d3.json('data/us.json'))
promises.push(d3.json('data/us-10m.v1.json')) //https://github.com/topojson/us-atlas
promises.push(d3.xml('img/logo_kantar_consulting.svg'))
promises.push(d3.xml('img/logo_motivemix.svg'))
promises.push(d3.csv('data/dimension_heatmap_values.csv', d => {
    return {
        appearance_aspirations: +d['Appearance Aspirations'],
        continuous_learning: +d['Continuous Learning'],
        cultural_connection: +d['Cultural Connection'],
        cultural_exploration: +d['Cultural Exploration'],
        environmentalism: +d['Environmentalism'],
        family_orientation: +d['Family Orientation'],
        financial_optimism: +d['Financial Optimism'],
        health_commitment: +d['Health Commitment'],
        natural_preferences: +d['Natural Preferences'],
        novelty_aspirations: +d['Novelty Aspirations'],
        religiosity: +d['Religiosity'],
        tech_disposition: +d['Tech Disposition']
    }
}))
promises.push(d3.csv('data/us_counties.csv', d => {
    return {
        fips: d.fips,
        state: d.state_abbr,
        county: d.county,
        latitude: +d.latitude,
        longitude: +d.longitude,
        x: +d.x,
        y: +d.y,
        appearance_aspirations_h: +d['Appearance Aspirations High'],
        appearance_aspirations_l: +d['Appearance Aspirations Low'],
        continuous_learning_h: +d['Continuous Learning High'],
        continuous_learning_l: +d['Continuous Learning Low'],
        cultural_connection_h: +d['Cultural Connection High'],
        cultural_connection_l: +d['Cultural Connection Low'],
        cultural_exploration_h: +d['Cultural Exploration High'],
        cultural_exploration_l: +d['Cultural Exploration Low'],
        environmentalism_h: +d['Environmentalism High'],
        environmentalism_l: +d['Environmentalism Low'],
        family_orientation_h: +d['Family Orientation High'],
        family_orientation_l: +d['Family Orientation Low'],
        financial_optimism_h: +d['Financial Optimism High'],
        financial_optimism_l: +d['Financial Optimism Low'],
        health_commitment_h: +d['Health Commitment High'],
        health_commitment_l: +d['Health Commitment Low'],
        natural_preferences_h: +d['Natural Preferences High'],
        natural_preferences_l: +d['Natural Preferences Low'],
        novelty_aspirations_h: +d['Novelty Aspirations High'],
        novelty_aspirations_l: +d['Novelty Aspirations Low'],
        religiosity_h: +d['Religiosity High'],
        religiosity_l: +d['Religiosity Low'],
        tech_disposition_h: +d['Tech Disposition High'],
        tech_disposition_l: +d['Tech Disposition Low']
    }
}))

let us
let logo_kantar, logo_motivemix
let heatmap_data
let county_data
       
Promise.all(promises).then(values => {

    us = values[0]
    logo_kantar = values[1]
    logo_motivemix = values[2]
    heatmap_data = values[3]
    county_data = values[4]
    // console.log(county_data[0])

    ///////////////////////// Add the creator's info /////////////////////////
    let credits = title_group.append('g')
        .attr('class', 'credits')
        .attr('transform', 'translate(' + [0, 7.5*73] + ')')

    credits.append('text')
        .text('Data + Story | Kantar')
    credits.append('text')
        .attr('dy', '1.7em')
        .text('Design + Creation | Visual Cinnamon')

    tl.add(() => { credits.style('opacity', 0) }, 'sceneStart')

    ///////////////////////// Create the title /////////////////////////
    //Add the SVG Kantar logo
    title_group.each(function() { this.appendChild(logo_kantar.documentElement) })
    // title_group.each(function() { this.appendChild(logo_motivemix.documentElement) })
    //Add the subtitle
    let subtitle = title_group.append('text')
        .attr('class', 'subtitle')
        .attr('dy', '0.75em')

    //Set initial title settings
    tl.set(title_group.node(), {opacity: 1}, 'sceneStart')
    tl.set(title_group.node(), {attr:{transform: 'translate(' + [width * 0.1, height * 0.15] + ')'}}, 'sceneStart')
    tl.set(subtitle.node(), {attr:{y: 3 * 73 * 0.6, x: -9}, css:{textAnchor: 'start', fontSize: '4.7em'}}, 'sceneStart')
    tl.add(() => {
        //Reposition and scale the Kantar logo
        title_group.selectAll('#kantar-group')
            .style('left', null)
            .style('transform', 'scale(0.4)')
        subtitle.text('New ways of looking at America') 
    }, 'sceneStart')

    //Fade out the initial scene
    tl.addLabel('sceneFadeTitle', '+=4') //'start+=4')
    tl.to(title_group.node(), 1, {opacity: 0, ease: Power1.easeInOut}, 'sceneFadeTitle')
    tl.to(document.getElementById('top-logo-row'), 1, {opacity: 1}, 'sceneFadeTitle')
    tl.to(document.getElementById('chart-text'), 1, {opacity: 1}, 'sceneFadeTitle+=1')
    // tl.to(document.getElementById('movie-container'), 1, {backgroundColor: '#ffffff', ease: Power1.easeInOut}, 'sceneFadeTitle')
    
    //Change the side text
    tl.to(side_text.node(), 0.3, {opacity: 0, onComplete: () => { side_text.html(side_text_html[1]) }}, 'sceneFadeTitle+=11')
    tl.to(side_text.node(), 0.5, {opacity: 1}, 'sceneFadeTitle+=11.5')

    ///////////////////////// Plot the states /////////////////////////

    const states = state_group.append('path')
        .datum(topojson.feature(us, us.objects.states))
        // .datum(topojson.feature(us, us.objects.counties))
        .attr('class', 'state')
        .style('fill','none')
        .style('stroke','url(#gold-gradient-states)')
        .style('stroke-width', 0.7)
        .attr('d', path_svg)

    tl.set(states.node(), {opacity: 0}, 'sceneStart')
    tl.to(states.node(), 1, {opacity: 1, ease: Power1.easeInOut}, 'sceneFadeTitle')

    ///////////////////////// Plot the counties /////////////////////////

    function setupCountyGeo() {
        let counties = topojson.feature(us, us.objects.counties).features//.sort((a,b) => a.id < b.id)
        let county_path_by_id = {}
        counties.forEach(d => {
            d.center = path.centroid(d) //Find the center of the path
            d.path_present = !isNaN(d.center[0]) ? 1 : 0
            county_path_by_id[d.id] = d
        })//forEach counties
        // console.log(counties[0])

        //Use the geo shape of a county to create an interpolator to a shape using flubber
        //https://github.com/veltman/flubber
        county_data.forEach(d => {
            let county_id = d.fips
            //Three states have been changed between the geo data and the MotiveMix
            //See https://www.cdc.gov/nchs/nvss/bridged_race/county_geography-_changes2015.pdf
            if(d.fips === '46113') county_id = '46102'
            else if(d.fips === '51515') county_id = '51019'
            else if(d.fips === '02270') county_id = '02158'
            d.county_path = county_path_by_id[county_id] || null
            // if(!d.county_path) console.log(d.fips)

            //Current total SVG path notation
            let path_notation = path_svg(d.county_path)
            //Diamond shape to morph into
            let c = d.county_path.center
            let diamond_shape = [[c[0]-diamond.w,c[1]], [c[0],c[1]-diamond.h], [c[0]+diamond.w,c[1]], [c[0],c[1]+diamond.h]]

            //If it's a multi shape do some stuff to make the interpolator work
            if(d.county_path.geometry.type !== 'MultiPolygon') {
                d.interpolator = flubber.interpolate(path_notation, diamond_shape)
            } else {
                //Split into the different segments
                path_notation = path_notation.split('M')
                path_notation.shift() //remove empty '' first element
                let path_notation_array = path_notation.map(p => 'M' + p)
                try {
                    //Remove all segments with 3 or less lines
                    path_notation = path_notation_array.filter(p => p.match(new RegExp('L', 'g') || []).length > 3)
                    d.interpolator = flubber.combine(path_notation, rect, { single: true })
                } catch (e) { //Otherwise take the biggest path
                    //Turn each element into its own shape
                    let shapes = d.county_path.geometry.coordinates.map(p => {
                        return {
                            type: 'Feature', 
                            geometry: { 'type': 'Polygon', 'coordinates': p}
                        }
                    })
                    //Find the location of the biggest shape
                    let areas = shapes.map(a => path_svg.area(a))
                    let biggest = areas.indexOf(Math.max(...areas))
                    //Use this for the interpolator
                    d.interpolator = flubber.interpolate(path_svg(shapes[biggest]), diamond_shape)
                }//catch
            }//else (multiple segments)

        })//forEach county_data
    }//function setupCountyGeo
    setupCountyGeo()

    //Draw the initial geo shape of each county
    function drawGeoCounties() {
        ctx.clearRect(0,0,width,height)
        ctx.strokeStyle = 'black'
        ctx.fillStyle = 'black'
        ctx.lineWidth = 0.5
        ctx.beginPath()
        county_data.forEach(d => { path(d.county_path) })
        ctx.closePath()
        ctx.fill()
    }//function drawGeoCounties
    tl.add(drawGeoCounties, this, 'sceneStart')

    ///////////////////////// Morph to the shapes in the center of each county /////////////////////////
    tl.addLabel('sceneMorphCounties', '+=3') //'sceneFadeTitle+=14')
    tl.call(morphCounties, [], this, 'sceneMorphCounties')
    tl.to(states.node(), 1, {opacity: 0}, 'sceneMorphCounties+=2')
    tl.to(side_text.node(), 0.3, {opacity: 0, onComplete: () => { side_text.html(side_text_html[2]) }}, 'sceneMorphCounties+=5')
    tl.to(side_text.node(), 0.5, {opacity: 1}, 'sceneMorphCounties+=5.6')

    function morphCounties() {
        const duration = 500
        const ease = d3.easeQuadInOut
        const max_delay = 1000
        
        //Set the delay based on the latitude of the county
        const delay_scale = d3.scaleLinear()
            .domain([390, 1500]).range([0, max_delay]).clamp(true)
        // console.log(d3.extent(county_data, d => d.county_path.center[0]))
        county_data.forEach(d => { d.delay = delay_scale(d.county_path.center[0]) })

        //Interpolate from black to white
        const interpolate_color = d3.interpolate('black', 'white')

        ctx.strokeStyle = 'black'
        ctx.lineWidth = 0.5
        let timer = d3.timer(elapsed => {
            ctx.clearRect(0,0,width,height)
            //Draw each county
            county_data
                .forEach(d => {
                    //Compute how far through the animation we are (0 to 1)
                    let t = ease(Math.min(1,Math.max(0,(elapsed - d.delay)/duration)))
                    ctx.fillStyle = interpolate_color(t)
                    let shape = new Path2D(d.interpolator(t))
                    ctx.fill(shape)
                    if(t < 1) ctx.stroke(shape)
    
                    // //Immediate from path to circle
                    // if(elapsed > d.delay) {
                    //     ctx.beginPath()
                    //     ctx.arc(d.center[0], d.center[1], 2, 0, pi2)
                    //     ctx.closePath()
                    //     ctx.fill()
                    // } else {
                    //     ctx.beginPath()
                    //     path(d)
                    //     ctx.closePath()
                    //     ctx.fill()
                    // }//else
                })
            if (elapsed >= duration + max_delay) timer.stop()
          })//timer
    }//function morphCounties

    ///////////////////////// Move the counties to their tSNE locations /////////////////////////
    tl.addLabel('sceneMoveCounties', '+=3') //'sceneMorphCounties+=8.5')
    tl.call(moveCounties, [], this, 'sceneMoveCounties')
    tl.to(side_text.node(), 0.3, {opacity: 0, onComplete: () => { side_text.html(side_text_html[3]) }}, 'sceneMoveCounties+=3')
    tl.to(side_text.node(), 0.5, {opacity: 1}, 'sceneMoveCounties+=3.6')

    function moveCounties() {
        const duration = 800
        const ease = d3.easeQuadInOut
        const max_delay = 3000
        ctx.fillStyle = 'white'
        
        const delay_scale = d3.scaleLinear()
            .domain([390, 1500]).range([0, max_delay]).clamp(true)
        // console.log(d3.extent(county_data, d => d.county_path.center[0]))
        county_data.forEach(d => { d.delay = delay_scale(d.county_path.center[0]) })

        //Interpolator for the increase in size of the shapes
        const interpolate_size = d3.interpolateNumber(1,3/2)
    
        let timer = d3.timer(elapsed => {
            ctx.clearRect(0,0,width,height)
            //Draw each county
            ctx.beginPath()
            county_data
                .forEach(d => {
                    //Compute how far through the animation we are (0 to 1)
                    //https://bocoup.com/blog/smoothly-animate-thousands-of-points-with-html5-canvas-and-d3
                    let t = ease(Math.min(1,Math.max(0,(elapsed - d.delay)/duration)))
                    let size_scale = interpolate_size(t)
                    //Center geo location of the county
                    let c = d.county_path.center
                    //Get the in between location of each county
                    let dx = c[0] * (1 - t) + x_scale(d.x) * t
                    let dy = c[1] * (1 - t) + y_scale(d.y) * t
                    drawDiamond(ctx, dx, dy, size_scale * diamond.w, size_scale * diamond.h)
                })//forEach
            ctx.closePath()
            ctx.fill()
            if (elapsed >= duration + max_delay) timer.stop()
          })//timer
    }//function moveCounties

    ///////////////////////// Highlight 1M+ counties /////////////////////////
    tl.addLabel('sceneHighlightCountiesBig', '+=7')
    tl.set(diamond, { w: 3, h: 1.4 * 3 }, 'sceneHighlightCountiesBig')
    //Change side text (& color)
    tl.to(side_text.node(), 0.3, {
        opacity: 0, onComplete: () => {
            document.documentElement.style.setProperty('--annotation-color', annotation_color_main)
            side_text.html(side_text_html[4])
        }
    }, 'sceneHighlightCountiesBig')
    tl.to(side_text.node(), 0.5, { opacity: 1 }, 'sceneHighlightCountiesBig+=0.6')
    //Highlight the chosen counties
    tl.call(highlightBigCounties, [annotation_color_main, 1500], this, 'sceneHighlightCountiesBig+=1')
    //Show the annotations
    tl.to(annotation_group.node(), 0.5, { opacity: 1, onStart: () => { annotateCountyName(annotations_big_counties) } }, 'sceneHighlightCountiesBig+=2.5')
    //Remove the annotations
    tl.to(annotation_group.node(), 0.5, { opacity: 0, onComplete: () => { annotation_group.selectAll('.annotations').remove() } }, 'sceneHighlightCountiesBig+=11')

    function highlightBigCounties(color_main, duration) {
        ctx.globalCompositeOperation = 'source-over'
        const ease = d3.easeCubicInOut
        let opacity_white = 0.5
        let max_scale = 3
        //Get an array with all the county names
        let places_big = annotations_big_counties.map(d => d.data.county + "-" + d.data.state)
        //Size change of the chosen shapes
        const interpolate_size = d3.interpolateNumber(1, max_scale)
        //Color change of the chosen shapes
        const interpolate_color_main = d3.interpolate('white', color_main)
        // Create interpolator for the opacity
        const interpolate_opacity = d3.interpolateNumber(1, opacity_white)

        let timer = d3.timer(elapsed => {
            ctx.clearRect(0, 0, width, height)
            let t = ease(Math.min(1, elapsed / duration)) //Compute how far through the animation we are (0 to 1)

            //Draw the non-chosen counties
            ctx.globalAlpha = interpolate_opacity(t)
            ctx.fillStyle = 'white'
            county_data
                .filter(d => places_big.indexOf(d.county + "-" + d.state) < 0)
                .forEach(d => {
                    ctx.beginPath()
                    drawDiamond(ctx, x_scale(d.x), y_scale(d.y), diamond.w, diamond.h)
                    ctx.closePath()
                    ctx.fill()
                })

            //Draw the big counties
            let size_scale = interpolate_size(t)
            ctx.fillStyle = interpolate_color_main(t)
            ctx.globalAlpha = 1
            county_data
                .filter(d => places_big.indexOf(d.county + "-" + d.state) >= 0)
                .forEach(d => {
                    ctx.beginPath()
                    drawDiamond(ctx, x_scale(d.x), y_scale(d.y), size_scale * diamond.w, size_scale * diamond.h)
                    ctx.closePath()
                    ctx.fill()
                })//forEach

            if (elapsed >= duration) timer.stop()
        })//timer
    }//function highlightBigCounties

    function annotateCountyName(annotations, hideRing = 1) {
        //Set-up the annotation
        const make_annotations = d3.annotation()
            .accessors({
                x: d => x_scale(d.x),
                y: d => y_scale(d.y)
            })
            .notePadding(5)
            .annotations(annotations)
        //Create the annotation
        annotation_group.call(make_annotations)
        //Adjust exact positions of labels
        d3.selectAll('.annotation-note-label').attr('y', 18)
        d3.selectAll('.annotation-note-content').attr('transform', function() {
            let regex = /[+-]?\d+(\.\d+)?/g
            let trans = d3.select(this).attr('transform')
            let floats = trans.match(regex).map(v => parseFloat(v))
            return 'translate(' + [floats[0], floats[1] + 1] + ')'
        })

        //Remove the outer rings
        if(hideRing) d3.selectAll('.annotation-subject').style('display', 'none')
    }//function annotateCountyName

    ///////////////////////// Highlight 1000- counties /////////////////////////
    tl.addLabel('sceneHighlightCountiesSmall')
    //Change side text (& color)
    tl.to(side_text.node(), 0.3, {
        opacity: 0, onComplete: () => {
            document.documentElement.style.setProperty('--annotation-color', annotation_color_secondary)
            side_text.html(side_text_html[5])
        }
    }, 'sceneHighlightCountiesSmall')
    tl.to(side_text.node(), 0.5, { opacity: 1 }, 'sceneHighlightCountiesSmall+=0.6')
    //Highlight the chosen counties
    tl.call(highlightSmallCounties, [annotation_color_main, annotation_color_secondary, 1500], this, 'sceneHighlightCountiesSmall+=0.6')
    //Show the annotations
    tl.to(annotation_group.node(), 0.5, { opacity: 1, onStart: () => { annotateCountyName(annotations_small_counties) } }, 'sceneHighlightCountiesSmall+=2')

    function highlightSmallCounties(color_main, color_secondary, duration) {
        ctx.globalCompositeOperation = 'source-over'
        const ease = d3.easeCubicInOut
        let opacity_white = 0.5
        let max_scale = 3
        //Get an array with all the county names
        let places_big = annotations_big_counties.map(d => d.data.county + "-" + d.data.state)
        let places_small = annotations_small_counties.map(d => d.data.county + "-" + d.data.state)
        //Size change of the chosen shapes
        const interpolate_size = d3.interpolateNumber(1, max_scale)
        //Color change of the chosen shapes
        const interpolate_color = d3.interpolate('white', color_secondary)
        // Create interpolator for the opacity
        const interpolate_opacity = d3.interpolateNumber(opacity_white, 1)
        
        let timer = d3.timer(elapsed => {
            ctx.clearRect(0, 0, width, height)
            let t = ease(Math.min(1, elapsed / duration)) //Compute how far through the animation we are (0 to 1)

            //Draw the non-chosen counties
            ctx.globalAlpha = opacity_white
            ctx.fillStyle = 'white'
            county_data
                .filter(d => places_big.indexOf(d.county + "-" + d.state) < 0 && places_small.indexOf(d.county + "-" + d.state) < 0)
                .forEach(d => { 
                    ctx.beginPath()
                    drawDiamond(ctx, x_scale(d.x), y_scale(d.y), diamond.w, diamond.h)
                    ctx.closePath()
                    ctx.fill()
                })

            //Draw the big counties that were already there
            ctx.fillStyle = color_main
            ctx.globalAlpha = 1
            county_data
                .filter(d => places_big.indexOf(d.county + "-" + d.state) >= 0)
                .forEach(d => {
                    ctx.beginPath()
                    drawDiamond(ctx, x_scale(d.x), y_scale(d.y), max_scale * diamond.w, max_scale * diamond.h)
                    ctx.closePath()
                    ctx.fill()
                })//forEach
            //Draw the small chosen counties that need to grow
            let size_scale = interpolate_size(t)
            ctx.fillStyle = interpolate_color(t)
            ctx.globalAlpha = interpolate_opacity(t)
            county_data
                .filter(d => places_small.indexOf(d.county + "-" + d.state) >= 0)
                .forEach(d => {
                    ctx.beginPath()
                    drawDiamond(ctx, x_scale(d.x), y_scale(d.y), size_scale * diamond.w, size_scale * diamond.h)
                    ctx.closePath()
                    ctx.fill()
                })//forEach

            if (elapsed >= duration) timer.stop()
        })//timer
    }//function highlightSmallCounties

    ///////////////////////// Fade all highlighted counties back /////////////////////////
    tl.addLabel('sceneFadeCounties', '+=8')
    //Change side text 
    tl.to(side_text.node(), 0.3, {opacity: 0, onComplete: () => { side_text.html(side_text_html[6]) }}, 'sceneFadeCounties')
    tl.to(side_text.node(), 0.5, {opacity: 1}, 'sceneFadeCounties+=0.6')
    //Remove the annotations
    tl.to(annotation_group.node(), 0.5, {opacity: 0, onComplete: () => { annotation_group.selectAll('.annotations').remove() }}, 'sceneFadeCounties+=2')
    //Fade the counties back
    tl.call(fadeBigSmallCounties, [annotation_color_main, annotation_color_secondary, 1500], this, 'sceneFadeCounties+=2')

    function fadeBigSmallCounties(color_main, color_secondary, duration) {
        ctx.globalCompositeOperation = 'source-over'
        const ease = d3.easeCubicInOut
        let max_scale = 3
        let opacity_white = 0.5
        //Get an array with all the county names
        let places_big = annotations_big_counties.map(d => d.data.county + "-" + d.data.state)
        let places_small = annotations_small_counties.map(d => d.data.county + "-" + d.data.state)
        //Size change of the chosen shapes
        const interpolate_size = d3.interpolateNumber(max_scale, 1)
        //Color change of the chosen shapes
        const interpolate_color_main = d3.interpolate(color_main, 'white')
        const interpolate_color_secondary = d3.interpolate(color_secondary, 'white')
        // Create interpolator for the opacity
        const interpolate_opacity = d3.interpolateNumber(1, opacity_white)
        
        let timer = d3.timer(elapsed => {
            ctx.clearRect(0, 0, width, height)
            let t = ease(Math.min(1, elapsed / duration)) //Compute how far through the animation we are (0 to 1)

            //Draw the non-chosen counties
            ctx.globalAlpha = opacity_white
            ctx.fillStyle = 'white'
            county_data
                .filter(d => places_big.indexOf(d.county + "-" + d.state) < 0 && places_small.indexOf(d.county + "-" + d.state) < 0)
                .forEach(d => { 
                    ctx.beginPath()
                    drawDiamond(ctx, x_scale(d.x), y_scale(d.y), diamond.w, diamond.h)
                    ctx.closePath()
                    ctx.fill()
                })

            //Draw the chosen counties
            let size_scale = interpolate_size(t)
            ctx.globalAlpha = interpolate_opacity(t)
            //Draw the big counties that need to scale down
            ctx.fillStyle = interpolate_color_main(t)
            county_data
                .filter(d => places_big.indexOf(d.county + "-" + d.state) >= 0)
                .forEach(d => {
                    ctx.beginPath()
                    drawDiamond(ctx, x_scale(d.x), y_scale(d.y), size_scale * diamond.w, size_scale * diamond.h)
                    ctx.closePath()
                    ctx.fill()
                })//forEach
            //Draw the small counties that need to scale down
            ctx.fillStyle = interpolate_color_secondary(t)
            county_data
                .filter(d => places_small.indexOf(d.county + "-" + d.state) >= 0)
                .forEach(d => {
                    ctx.beginPath()
                    drawDiamond(ctx, x_scale(d.x), y_scale(d.y), size_scale * diamond.w, size_scale * diamond.h)
                    ctx.closePath()
                    ctx.fill()
                })//forEach

            if (elapsed >= duration) timer.stop()
        })//timer
    }//function highlightCounties

    ///////////////////////// Highlight "diversely placed" 1000- counties /////////////////////////
    tl.addLabel('sceneHighlightCountiesDifferent', '+=4')
    //Change side text 
    tl.to(side_text.node(), 0.3, {
        opacity: 0, onComplete: () => {
            document.documentElement.style.setProperty('--annotation-color', annotation_color_secondary)
            side_text.html(side_text_html[7])
        }
    }, 'sceneHighlightCountiesDifferent')
    tl.to(side_text.node(), 0.5, {opacity: 1}, 'sceneHighlightCountiesDifferent+=0.6')
    //Highlight the chosen counties
    tl.call(highlightDifferentCounties, [annotation_color_secondary, 1500, 'up'], this, 'sceneHighlightCountiesDifferent+=0.6')
    //Show the annotations
    tl.to(annotation_group.node(), 0.5, { opacity: 1, onStart: () => { annotateCountyName(annotations_different_counties) } }, 'sceneHighlightCountiesDifferent+=2')
    //Fade the chosen counties back to normal
    tl.call(highlightDifferentCounties, [annotation_color_secondary, 1000, 'down'], this, 'sceneHighlightCountiesDifferent+=14')
    //Remove the annotations
    tl.to(annotation_group.node(), 0.5, {opacity: 0, onComplete: () => { annotation_group.selectAll('.annotations').remove() }}, 'sceneHighlightCountiesDifferent+=14')

    function highlightDifferentCounties(color, duration, scale_direction) {
        ctx.globalCompositeOperation = 'source-over'
        const ease = d3.easeCubicInOut
        let max_scale = 3
        let opacity_white = 0.5
        //Get an array with all the county names
        let places = annotations_different_counties.map(d => d.data.county + "-" + d.data.state)

        //Size change of the chosen shapes
        const interpolate_size = (scale_direction === 'up' ? d3.interpolateNumber(1, max_scale) : d3.interpolateNumber(max_scale, 1))
        //Color change of the chosen shapes
        const interpolate_color = (scale_direction === 'up' ? d3.interpolate('white', color) : d3.interpolate(color, 'white'))
        // Create interpolator for the opacity
        const interpolate_opacity = d3.interpolateNumber(opacity_white, 1)
        
        let timer = d3.timer(elapsed => {
            ctx.clearRect(0, 0, width, height)
            let t = ease(Math.min(1, elapsed / duration)) //Compute how far through the animation we are (0 to 1)

            //Draw the non-chosen counties
            ctx.fillStyle = 'white'
            ctx.globalAlpha = (scale_direction === 'up' ? opacity_white : interpolate_opacity(t))
            county_data
                .filter(d => places.indexOf(d.county + "-" + d.state) < 0)
                .forEach(d => { 
                    ctx.beginPath()
                    drawDiamond(ctx, x_scale(d.x), y_scale(d.y), diamond.w, diamond.h)
                    ctx.closePath()
                    ctx.fill()
                })

            //Draw the chosen counties
            // ctx.globalCompositeOperation = 'multiply'
            ctx.fillStyle = interpolate_color(t)
            ctx.globalAlpha = (scale_direction === 'up' ? interpolate_opacity(t) : 1)
            let size_scale = interpolate_size(t)
            county_data
                .filter(d => places.indexOf(d.county + "-" + d.state) >= 0)
                .forEach(d => {
                    ctx.beginPath()
                    drawDiamond(ctx, x_scale(d.x), y_scale(d.y), size_scale * diamond.w, size_scale * diamond.h)
                    ctx.closePath()
                    ctx.fill()
                })//forEach

            if (elapsed >= duration) timer.stop()
        })//timer
    }//function highlightDifferentCounties

    ///////////////////////// Highlight state - Texas /////////////////////////
    tl.addLabel('sceneHighlightTexas')
    //Change side text (& color)
    tl.to(side_text.node(), 0.3, {opacity: 0, onComplete: () => {
        document.documentElement.style.setProperty('--annotation-color', annotation_color_main) 
        side_text.html(side_text_html[8]) 
    }}, 'sceneHighlightTexas')
    tl.to(side_text.node(), 0.5, {opacity: 1}, 'sceneHighlightTexas+=0.6')
    //Highlight state
    tl.call(highlightStates, ['TX', annotation_color_main, 1500, 'up'], this, 'sceneHighlightTexas+=1')
    //Show the annotations
    tl.to(annotation_group.node(), 0.5, {opacity: 1, onStart: () => { annotateCountyName(annotations_texas, 0) }}, 'sceneHighlightTexas+=2.5')
    //Fade shapes back to normal
    tl.call(highlightStates, ['TX', annotation_color_main, 1000, 'down'], this, 'sceneHighlightTexas+=13')
    //Remove the annotations
    tl.to(annotation_group.node(), 0.5, {opacity: 0, onComplete: () => { annotation_group.selectAll('.annotations').remove() }}, 'sceneHighlightTexas+=13')

    function highlightStates(chosen_state, color, duration, scale_direction) {
        const ease = d3.easeCubicInOut
        let max_scale = 3
        ctx.globalAlpha = 1
        //Size change of the chosen shapes
        const interpolate_size = (scale_direction === 'up' ? d3.interpolateNumber(1, max_scale) : d3.interpolateNumber(max_scale, 1))
        //Color change of the chosen shapes
        const interpolate_color = (scale_direction === 'up' ? d3.interpolate('white', color) : d3.interpolate(color, 'white'))

        let timer = d3.timer(elapsed => {
            ctx.clearRect(0,0,width,height)
            let t = ease(Math.min(1, elapsed/duration)) //Compute how far through the animation we are (0 to 1)

            //Draw the non-chosen counties
            ctx.globalCompositeOperation = 'source-over'
            ctx.fillStyle = 'white'
            county_data
                .filter(d => d.state !== chosen_state)
                .forEach(d => { 
                    ctx.beginPath()
                    drawDiamond(ctx, x_scale(d.x), y_scale(d.y), diamond.w, diamond.h)
                    ctx.closePath()
                    ctx.fill()
                })

            //Draw the chosen counties
            ctx.globalCompositeOperation = 'multiply'
            let size_scale = interpolate_size(t)
            ctx.fillStyle = interpolate_color(t)
            county_data
                .filter(d => d.state === chosen_state)
                .forEach(d => {
                    ctx.beginPath()
                    drawDiamond(ctx, x_scale(d.x), y_scale(d.y), size_scale * diamond.w, size_scale * diamond.h)
                    ctx.closePath()
                    ctx.fill()
                })//forEach

            if (elapsed >= duration) timer.stop()
          })//timer
    }//function highlightStates

    ///////////////////////// Highlight state - California /////////////////////////
    tl.addLabel('sceneHighlightCalifornia', '+=0.5')
    //Change side text (& color)
    tl.to(side_text.node(), 0.3, {
        opacity: 0, onComplete: () => {
            document.documentElement.style.setProperty('--annotation-color', annotation_color_main)
            side_text.html(side_text_html[9])
        }
    }, 'sceneHighlightCalifornia')
    tl.to(side_text.node(), 0.5, { opacity: 1 }, 'sceneHighlightCalifornia+=1')
    //Highlight state
    tl.call(highlightStates, ['CA', annotation_color_main, 1500, 'up'], this, 'sceneHighlightCalifornia+=1.5')
    //Show the annotations
    tl.to(annotation_group.node(), 0.5, { opacity: 1, onStart: () => { annotateCountyName(annotations_california, 0) } }, 'sceneHighlightCalifornia+=3')
    //Fade shapes back to normal
    tl.call(highlightStates, ['CA', annotation_color_main, 1000, 'down'], this, 'sceneHighlightCalifornia+=7')
    //Remove the annotations
    tl.to(annotation_group.node(), 0.5, { opacity: 0, onComplete: () => { annotation_group.selectAll('.annotations').remove() } }, 'sceneHighlightCalifornia+=7')

    ///////////////////////// Color the shapes by dimension /////////////////////////
    tl.addLabel('sceneChangeColorToDimension')
    //Change side text
    tl.to(side_text.node(), 0.3, {opacity: 0, onComplete: () => { side_text.html(side_text_html[10]) }}, 'sceneChangeColorToDimension')
    tl.to(side_text.node(), 0.5, {opacity: 1}, 'sceneChangeColorToDimension+=1')
    //Change the color the the county shapes
    tl.call(changeShapeColor, ['Environmentalism', 'color'], this, 'sceneChangeColorToDimension+=2')
    //Show the legend
    tl.to(legend_group.node(), 1, {opacity: 1, onStart: () => { changeLegendTitle('Environmentalism') }}, 'sceneChangeColorToDimension+=4')
    //Show annotations
    tl.to(annotation_group.node(), 1, {opacity: 0.5, onStart: () => { 
        document.documentElement.style.setProperty('--annotation-color', 'white') 
        annotateCountyName(annotation_counties) 
    }}, 'sceneChangeColorToDimension+=4')

    //Update the color of the shapes according to 10 bins of 1 dimension
    function changeShapeColor(dimension, type) {
        //Transition settings
        const duration = 600
        const ease = d3.easeCubicInOut
        const max_delay = 900
        const delay_scale = d3.scaleLinear()
            .domain([9, 0]).range([0, max_delay]).clamp(true)

        //Calculate the quantile
        quantileData(dimension)
        //Calculate the color interpolator and the delay
        county_data.forEach(d => {
            d.interpolate_color = (type === 'color' ? d3.interpolate('white', d.color_heatmap) : d3.interpolate(d.color_heatmap, 'white') )
            //Get the delay based on the quantile
            d.delay = delay_scale(d.index_heatmap - 1) 
        })

        //Draw the shapes
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
        let timer = d3.timer(elapsed => {
            ctx.clearRect(0,0,width,height)
            county_data
                .forEach(d => {
                    let t = ease(Math.min(1,(elapsed - d.delay)/duration))
                    ctx.fillStyle = d.interpolate_color(t)
                    ctx.beginPath()
                    drawDiamond(ctx, x_scale(d.x), y_scale(d.y), diamond.w, diamond.h)
                    ctx.closePath()
                    ctx.fill()
                })//forEach
                if (elapsed >= duration + max_delay) timer.stop()
            })//timer
    }//function changeShapeColor

    //Calculate 10 bins of equal number of data points for the variable of dimension
    function quantileData(dimension) {
        const dimension_name = `${dimension.replace(/ /g,'_').toLowerCase()}_h`

        //Bin the values into 10 equally sized bins
        let values = county_data.map(d => d[dimension_name]).sort()
        let quants = d3.range(10).map(d => d3.quantile(values, d / 10))
        quants.push(1)

        //Calculate the color interpolator and the delay
        county_data.forEach(d => {
            //Get the value that is just higher
            d.index_heatmap= quants.findIndex(n => n > d[dimension_name])
            d.color_heatmap = color_heatmap_scale(d.index_heatmap - 1).hex()
        })
    }//function quantileData

    ///////////////////////// Introduce heatmap /////////////////////////
    tl.addLabel('sceneOverlayHeatmap', '+=11')
    //Change side text
    tl.to(side_text.node(), 0.3, {opacity: 0, onComplete: () => { side_text.html(side_text_html[11]) }}, 'sceneOverlayHeatmap')
    tl.to(side_text.node(), 0.5, {opacity: 1}, 'sceneOverlayHeatmap+=1')
    //Add the heatmap overlay
    tl.call(drawHeatmap, ['Environmentalism', 'in', 2000], this, 'sceneOverlayHeatmap+=2')
    //Fade out the county shapes
    tl.call(fadeOpacityShapes, ['Environmentalism', [1, 0], 100], this, 'sceneOverlayHeatmap+=4')

    function drawHeatmap(dimension, direction, duration) {
        const dimension_name = `${dimension.replace(/ /g,'_').toLowerCase()}`
        //Transition settings
        const ease = d3.easeQuadInOut

        // //Draw the shapes
        // ctx.globalCompositeOperation = 'source-over'
        // ctx.clearRect(0,0,width,height)
        // county_data
        //     .forEach(d => {
        //         ctx.fillStyle = 'white' //d.color_heatmap
        //         ctx.beginPath()
        //         drawDiamond(ctx, x_scale(d.x), y_scale(d.y), diamond.w, diamond.h)
        //         ctx.closePath()
        //         ctx.fill()
        //     })//forEach

        //Set-up density contour https://github.com/d3/d3-contour
        const contour = d3.contours()
            .size([n, m])
            .thresholds([1,2,3,4,5,6,7,8,9,10])

        //Create the geoPath to scale and move the heatmap into place
        const contour_projection = d3.geoIdentity()
            .scale((x_range[1] - x_range[0]) / n * 1.05)
            .translate([x_range[0] - 20, y_range[0] - 45])
    
        //Create the contour data
        let contour_data = contour(heatmap_data.map(d => d[dimension_name]))
        // console.log(contour_data.map(d => d.value))

        // //Draw the SVG contour shapes
        // contour_group
        //     .selectAll('.contour')
        //     .data(contour_data)
        //     .enter().append('path')
        //     .attr('class', 'contour')
        //     .attr('fill', d => color_heatmap_scale(d.value-1))
        //     .attr('d', d3.geoPath(contour_projection))
        //     .style('opacity', 0.4)
        //     // .transition().duration(1500)
        //     // .style('opacity', 1)

        //Draw the shapes
        const contour_path = d3.geoPath(contour_projection).context(ctx_heatmap)
        ctx_heatmap.save()
        ctx_heatmap.scale(1, -1)
        ctx_heatmap.translate(0, -height)

        let timer = d3.timer(elapsed => {
            let t = ease(Math.min(1,elapsed/duration))

            //Fade in the contours
            ctx_heatmap.clearRect(0,0,width,height)
            ctx_heatmap.globalAlpha = (direction === 'out' ? 1 - t : t)
            contour_data.forEach(d => {
                ctx_heatmap.beginPath()
                contour_path(d)
                ctx_heatmap.fillStyle = color_heatmap_scale(d.value - 1)
                ctx_heatmap.fill()
            })//forEach

            if (elapsed >= duration) {
                ctx_heatmap.restore()
                timer.stop()
            }//if
        })//timer
    }//function drawHeatmap

    //Fade out the county shapes
    function fadeOpacityShapes(dimension, opacity, duration) {
        const ease = d3.easeQuadInOut
        ctx.globalCompositeOperation = 'source-over'

        //Calculate the quantile groups for the chosen dimension
        let do_color = false
        if(dimension_order.indexOf(dimension) > -1) {
            do_color = true
            quantileData(dimension)
        }

        //Create interpolator for the opacity
        const interpolate_opacity = d3.interpolateNumber(opacity[0], opacity[1])

        let timer = d3.timer(elapsed => {
            let t = ease(Math.min(1,elapsed/duration))

            //Fade out the shapes
            ctx.clearRect(0,0,width,height)
            ctx.globalAlpha = interpolate_opacity(t)
            county_data
                .forEach(d => {
                    ctx.fillStyle = (do_color ? d.color_heatmap : 'white')
                    ctx.beginPath()
                    drawDiamond(ctx, x_scale(d.x), y_scale(d.y), diamond.w, diamond.h)
                    ctx.closePath()
                    ctx.fill()
                })//forEach

            if (elapsed >= duration) {
                ctx.globalAlpha = 1
                timer.stop()
            }//if
        })//timer
    }//function fadeOpacityShapes

    ///////////////////////// Remove heatmap /////////////////////////
    tl.addLabel('sceneRemoveHeatmap', '+=11')
    //Change side text
    tl.to(side_text.node(), 0.3, {opacity: 0, onComplete: () => { side_text.html(side_text_html[12]) }}, 'sceneRemoveHeatmap')
    tl.to(side_text.node(), 0.5, {opacity: 1}, 'sceneRemoveHeatmap+=1')
    //Fade out the contour map
    tl.call(drawHeatmap, ['Environmentalism', 'out', 1000], this, 'sceneRemoveHeatmap+=2')
    //Hide the legend
    tl.to(legend_group.node(), 0.5, {opacity: 0}, 'sceneRemoveHeatmap+=2.5')
    //Fade in the county shapes to white
    tl.call(fadeOpacityShapes, ['white', [0, 0.7], 1000], this, 'sceneRemoveHeatmap+=2')

    ///////////////////////// Loop over a few other heatmaps /////////////////////////
    tl.addLabel('sceneLoopHeatmaps', '+=3')
    //Hide the legend title
    tl.set(legend_group.selectAll('.legend-title').node(), {opacity: 0}, 'sceneLoopHeatmaps')
    
    //Loop over several dimensions
    const loop_dimensions = ['Appearance Aspirations','Religiosity','Financial Optimism','Tech Disposition']
    loop_dimensions.forEach((d,i) => {
        //Change side text
        tl.to(side_text.node(), 0.25, {opacity: 0, onComplete: () => { side_text.html(`<p><b>${d}</b></p>`) }}, `sceneLoopHeatmaps+=${i*5.25}`)
        //Add the heatmap overlay
        tl.call(drawHeatmap, [d, 'in', 800], this, '+=0.5')
        //Fade in text
        tl.to(side_text.node(), 0.3, {opacity: 1})
        //Show the legend
        tl.to(legend_group.node(), 0.5, {opacity: 1, onStart: changeLegendTitle, onStartParams: [''] })
        //Fade out the heatmap overlay
        tl.call(drawHeatmap, [d, 'out', 500], this, '+=3')
    })//forEach

    //Hide the legend
    tl.to(legend_group.node(), 0.5, {opacity: 0})
    tl.to(annotation_group.node(), 0.5, {opacity: 0, onComplete: () => { annotation_group.selectAll('.annotations').remove() }})

    ///////////////////////// Move back to geo locations /////////////////////////
    tl.addLabel('sceneMorphBack')
    //Change the side text
    tl.to(side_text.node(), 0.3, {opacity: 0, onComplete: () => { side_text.html(side_text_html[13]) }}, 'sceneMorphBack')
    tl.to(side_text.node(), 0.5, {opacity: 1}, 'sceneMorphBack+=0.6')
    //Move the counties back to their geo locations
    tl.set(diamond, {w: 2, h: 1.4 * 2}, 'sceneMorphBack')
    tl.call(moveCountiesBack, [], this, 'sceneMorphBack+=1.5')
    //Show the state outlines
    tl.to(states.node(), 1, {opacity: 1}, 'sceneMorphBack+=2.5')
    //Fade out the counties
    tl.call(fadeOpacityGeo, [], this, 'sceneMorphBack+=4')

    function moveCountiesBack() {
        const duration = 1000
        const ease = d3.easeQuadInOut
        const max_delay = 1500
        ctx.fillStyle = 'white'
        
        //Add a delay to each county
        const delay_scale = d3.scaleLinear()
            .domain([390, 1500]).range([max_delay, 0]).clamp(true)
        county_data.forEach(d => { d.delay = delay_scale(d.county_path.center[0]) })

        //Interpolator for the increase in size of the shapes
        const interpolate_size = d3.interpolateNumber(1,3/2)
        //Create interpolator for the opacity
        const interpolate_opacity = d3.interpolateNumber(1, 0.7)
    
        let timer = d3.timer(elapsed => {
            ctx.clearRect(0,0,width,height)
            //Draw each county
            county_data
                .forEach(d => {
                    //Compute how far through the animation we are (0 to 1)
                    let t = ease(Math.min(1,Math.max(0,(elapsed - d.delay)/duration)))
                    t = 1 - t
                    let size_scale = interpolate_size(t)
                    ctx.globalAlpha = interpolate_opacity(t)
                    //Center geo location of the county
                    let c = d.county_path.center
                    //Get the in between location of each county
                    let dx = c[0] * (1 - t) + x_scale(d.x) * t
                    let dy = c[1] * (1 - t) + y_scale(d.y) * t
                    //Draw the shape
                    ctx.beginPath()
                    drawDiamond(ctx, dx, dy, size_scale * diamond.w, size_scale * diamond.h)
                    ctx.closePath()
                    ctx.fill()
                })//forEach
            if (elapsed >= duration + max_delay) {
                ctx.globalAlpha = 1
                timer.stop()
            }//if
          })//timer
    }//function moveCountiesBack

    function fadeOpacityGeo() {
        const duration = 1000
        const ease = d3.easeCubicIn
        const max_delay = 1500
        ctx.fillStyle = 'white'
        
        //Add delay to each county
        const delay_scale = d3.scaleLinear()
            .domain([390, 1500]).range([0, max_delay]).clamp(true)
        county_data.forEach(d => { d.delay = delay_scale(d.county_path.center[0]) })

        //Create interpolator for the opacity
        const interpolate_opacity = d3.interpolateNumber(1, 0)
    
        let timer = d3.timer(elapsed => {
            ctx.clearRect(0,0,width,height)
            //Draw each county
            county_data
                .forEach(d => {
                    //Compute how far through the animation we are (0 to 1)
                    let t = ease(Math.min(1,Math.max(0,(elapsed - d.delay)/duration)))
                    //Center geo location of the county
                    let c = d.county_path.center
                    //Draw the shape
                    ctx.globalAlpha = interpolate_opacity(t)
                    ctx.beginPath()
                    drawDiamond(ctx, c[0], c[1], diamond.w, diamond.h)
                    ctx.closePath()
                    ctx.fill()
                })//forEach
            if (elapsed >= duration + max_delay) {
                ctx.globalAlpha = 1
                timer.stop()
            }//if
          })//timer
    }//function fadeOpacityGeo

    ///////////////////////// Show final screen /////////////////////////
    tl.addLabel('sceneEnd', '+=3')
    //Set the kantar logo and subtitle into the new position
    tl.set(title_group.node(), {attr:{transform: 'translate(' + [1920/2, height * 0.4] + ')'}}, 'sceneEnd')
    tl.set(subtitle.node(), {attr:{y: 4.5 * 73, x: 0}, css:{textAnchor: 'middle', fontSize: '2.4em'}}, 'sceneEnd')
    tl.add(() => {
        ctx.clearRect(0,0,width,height)
        title_group.selectAll('#kantar-group')
            .style('left', '50%')
            .style('transform', 'translateX(-50%)')
        subtitle.text('KantarConsulting.com') 
        credits.style('opacity', 1) 
    }, 'sceneEnd')

    //Fade out the US shape & text and fade in the Kantar logo
    tl.to(side_text.node(), 0.5, {opacity: 0}, 'sceneEnd')
    tl.to(document.getElementById('top-logo-row'), 1, {opacity: 0}, 'sceneEnd')
    tl.to(states.node(), 0.5, {opacity: 0}, 'sceneEnd')
    tl.to(title_group.node(), 0.7, {opacity: 1, ease: Power1.easeInOut}, 'sceneEnd+=0.5')
    //Fade in the creators info

    /////////////////////// Run the animation /////////////////////////
    // tl.play('sceneChangeColorToDimension')
    tl.play()
})

//////////////////// Draw a diamond shape ////////////////////
//https://websanova.com/blog/html5/10-shapes-to-extend-html5-canvas
function drawDiamond(ctx, x, y, w, h) {
    ctx.moveTo(x + w, y)
    ctx.lineTo(x, y + h)
    ctx.lineTo(x - w, y)
    ctx.lineTo(x, y - h)
    ctx.lineTo(x + w, y)
}//function drawDiamond

////////////////// Retina non-blurry canvas //////////////////
function crispyCanvas(canvas, ctx, width, height) {
    const sf = Math.min(2, getPixelRatio(ctx))
    canvas
        .attr('width', sf * width)
        .attr('height', sf * height)
        .style('width', width + 'px')
        .style('height', height + 'px')
    ctx.scale(sf, sf)
}//function crispyCanvas

////////////////// Find the device pixel ratio //////////////////
function getPixelRatio(ctx) {
    //From https://www.html5rocks.com/en/tutorials/canvas/hidpi/
    let devicePixelRatio = window.devicePixelRatio || 1
    let backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1
    let ratio = devicePixelRatio / backingStoreRatio
    return ratio
}//function getPixelRatio

////////////////// Wrap text in SVG //////////////////
function wrap(text, width, heightLine) {
    text.each(function () {
        let text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = (typeof heightLine === 'undefined' ? 1.6 : heightLine), // ems
            y = text.attr('y'),
            x = text.attr('x'),
            dy = parseFloat(text.attr('dy')),
            tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em')
        while (word = words.pop()) {
            line.push(word)
            tspan.text(line.join(' '))
            if (tspan.node().getComputedTextLength() > width) {
                line.pop()
                tspan.text(line.join(' '))
                line = [word]
                tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word)
            }
        }
    })
}//wrap
    