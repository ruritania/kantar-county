const ring_radius_hidden = 12
const ring_padding_hidden = 0
const ring_radius = 18
const ring_padding = 4

///////////////////////// Big counties in the same location /////////////////////////
let annotations_big_counties = [
    {
        className: 'annotation-note',
        note: { title: 'LA County, CA', label: 'population: 5,8 million', wrap: 200 },
        data: { x: -23.5207679342487, y: 12.1798927351492, county: 'Los Angeles', state: 'CA' },
        type: d3.annotationCalloutCircle,
        dx: -110,
        dy: 20,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    }, {
        className: 'annotation-note',
        note: { title: 'Cook County, IL', label: 'population: 3,2 million', wrap: 200 },
        data: { x: -23.1800772869981, y: 10.9687200584552, county: 'Cook', state: 'IL' },
        type: d3.annotationCalloutCircle,
        dx: -90,
        dy: 70,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    }, {
        className: 'annotation-note',
        note: { title: 'Maricopa County, AZ', label: 'population: 2.8 million', wrap: 200 },
        data: { x: -21.3039975947282, y: 4.64500788475697, county: 'Maricopa', state: 'AZ' },
        type: d3.annotationCalloutCircle,
        dx: -120,
        dy: 60,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    }, {
        className: 'annotation-note',
        note: { title: 'Harris County, TX', label: 'population: 2.6 million', wrap: 200 },
        data: { x: -22.4467731420694, y: 14.1333846326255, county: 'Harris', state: 'TX' },
        type: d3.annotationCalloutCircle,
        dx: -130,
        dy: -45,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    }, {
        className: 'annotation-note',
        note: { title: 'Miami-Dade County, FL', label: 'population: 2.2 million', wrap: 200 },
        data: { x: -23.2134660707166, y: 17.8163281056812, county: 'Miami-Dade', state: 'FL' },
        type: d3.annotationCalloutCircle,
        dx: -20,
        dy: -200,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    }, {
        className: 'annotation-note',
        note: { title: 'Kings County, NY', label: 'population: 1.8 million', wrap: 200 },
        data: { x: -24.5872039939001, y: 16.7522605860382, county: 'Kings', state: 'NY' },
        type: d3.annotationCalloutCircle,
        dx: -70,
        dy: -70,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    }, {
        className: 'annotation-note',
        note: { title: 'Clark County, NV', label: 'population: 1.7 million', wrap: 200 },
        data: { x: -22.3664402550475, y: 12.5437230014408, county: 'Clark', state: 'NV' },
        type: d3.annotationCalloutCircle,
        dx: -90,
        dy: -10,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    }, {
        //     className: 'annotation-note',
        //     note: {title: 'Wayne County, MI', label: 'population: 1.6 million', wrap: 200},
        //     data: {x: -22.1620698703731, y: 14.7927831047011, county: 'Wayne', state: 'MI'},
        //     type: d3.annotationCalloutCircle,
        //     dx: -55,
        //     dy: -190,
        //     subject: {
        //         radius: ring_radius_hidden,
        //         radiusPadding: ring_padding_hidden
        //     }
        // },{
        className: 'annotation-note',
        note: { title: 'Philadelphia County, PA', label: 'population: 1.0 million', wrap: 200 },
        data: { x: -23.2577566234725, y: 15.6933910696225, county: 'Philadelphia', state: 'PA' },
        type: d3.annotationCalloutCircle,
        dx: -50,
        dy: -160,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    },
]

///////////////////////// Small counties in similar locations as big cities /////////////////////////
let annotations_small_counties = [
    {
        className: 'annotation-note',
        note: { title: 'Aleutians East County, AK', label: 'population: 675', wrap: 200 },
        data: { x: -15.9165305349099, y: 13.2509051856193, county: 'Aleutians East', state: 'AK' },
        type: d3.annotationCalloutCircle,
        dx: -80,
        dy: -130,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    }, {
        className: 'annotation-note',
        note: { title: 'Yakutat County, AK', label: 'population: 439', wrap: 200 },
        data: { x: -13.2776171349133, y: 6.39259821053372, county: 'Yakutat', state: 'AK' },
        type: d3.annotationCalloutCircle,
        dx: -220,
        dy: -40,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    }, {
        className: 'annotation-note',
        note: { title: 'Shannon County, SD', label: 'population: 112', wrap: 200 },
        data: { x: -26.050778480134, y: 15.2037878492116, county: 'Shannon', state: 'SD' },
        type: d3.annotationCalloutCircle,
        dx: -60,
        dy: -30,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    }, {
        className: 'annotation-note',
        note: { title: 'Alpine County, CA', label: 'population: 576', wrap: 200 },
        data: { x: -16.0564165949853, y: 0.694239779171621, county: 'Alpine', state: 'CA' },
        type: d3.annotationCalloutCircle,
        dx: -140,
        dy: 40,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    }, {
        className: 'annotation-note',
        note: { title: 'Glasscock County, TX', label: 'population: 708', wrap: 200 },
        data: { x: -10.2170182912643, y: 5.51294491596536, county: 'Glasscock', state: 'TX' },
        type: d3.annotationCalloutCircle,
        dx: -280,
        dy: 20,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    },
]

///////////////////////// Small counties from all over the tSNE map /////////////////////////
let annotations_different_counties = [
    {
        className: 'annotation-note',
        note: { title: 'Mellette County, SD', label: 'population: 851', wrap: 200 },
        data: { x: -4.52003867662281, y: -7.08917059441296, county: 'Mellette', state: 'SD' },
        type: d3.annotationCalloutCircle,
        dx: -240,
        dy: 40,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    }, {
        className: 'annotation-note',
        note: { title: 'Issaquena County, MS', label: 'population: 421', wrap: 200 },
        data: { x: -16.3326750364965, y: 29.8486160202432, county: 'Issaquena', state: 'MS' },
        type: d3.annotationCalloutCircle,
        dx: -90,
        dy: 30,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    }, {
        className: 'annotation-note',
        note: { title: 'Esmeralda County, NV', label: 'population: 418', wrap: 200 },
        data: { x: 16.8682002778854, y: 6.60359402817691, county: 'Esmeralda', state: 'NV' },
        type: d3.annotationCalloutCircle,
        dx: 80,
        dy: -40,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    }, {
        className: 'annotation-note',
        note: { title: 'Petroleum County, MT', label: 'population: 319', wrap: 200 },
        data: { x: 24.3424864012582, y: -24.75524617176, county: 'Petroleum', state: 'MT' },
        type: d3.annotationCalloutCircle,
        dx: -60,
        dy: 50,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    }, {
        className: 'annotation-note',
        note: { title: 'San Juan County, CO', label: 'population: 317', wrap: 200 },
        data: { x: 1.28646976694661, y: -28.9850530566916, county: 'San Juan', state: 'CO' },
        type: d3.annotationCalloutCircle,
        dx: -80,
        dy: 30,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    }, {
        className: 'annotation-note',
        note: { title: 'Kenedy County, TX', label: 'population: 121', wrap: 200 },
        data: { x: 0.444532157821985, y: 26.4051466293753, county: 'Kenedy', state: 'TX' },
        type: d3.annotationCalloutCircle,
        dx: 60,
        dy: -30,
        subject: {
            radius: ring_radius_hidden,
            radiusPadding: ring_padding_hidden
        }
    },
]

///////////////////////// Example counties from Texas /////////////////////////
let annotations_texas = [
    {
        className: 'annotation-note',
        note: { title: 'Houston County', label: 'population: 23,000', wrap: 150 },
        data: { x: -0.583397650881503, y: 20.0479258369493 },
        type: d3.annotationCalloutCircle,
        dy: -70,
        dx: 35,
        subject: {
            radius: ring_radius,
            radiusPadding: ring_padding
        }
    }, {
        className: 'annotation-note',
        note: { title: 'Dallas County', label: 'population: 2,5 million', wrap: 200 },
        data: { x: -22.402819166628, y: 14.4172719455452 },
        type: d3.annotationCalloutCircle,
        dy: -30,
        dx: -60,
        subject: {
            radius: ring_radius,
            radiusPadding: ring_padding
        }
    }, {
        className: 'annotation-note',
        note: { title: 'Donley County', label: 'population: 3,400', wrap: 150 },
        data: { x: 25.7042994245736, y: -24.324900005875 },
        type: d3.annotationCalloutCircle,
        dy: -40,
        dx: 40,
        subject: {
            radius: ring_radius,
            radiusPadding: ring_padding
        }
    },
]

///////////////////////// Example counties from California /////////////////////////
let annotations_california = [
    {
        className: 'annotation-note',
        note: {title: 'San Francisco County', label: 'population: 885,000', wrap: 200},
        data: {x: -27.196340081669, y:8.01657011077505},
        type: d3.annotationCalloutCircle,
        dy: -30,
        dx: -1,
        subject: {
            radius: ring_radius,
            radiusPadding: ring_padding
        }
    },{
        className: 'annotation-note',
        note: {title: 'Los Angeles County', label: 'population: 10,2 million', wrap: 200},
        data: {x: -23.5207679342487, y:12.1798927351492},
        type: d3.annotationCalloutCircle,
        dy: -40,
        dx: -60,
        subject: {
            radius: ring_radius,
            radiusPadding: ring_padding
        }
    },{
        className: 'annotation-note',
        note: {title: 'Mariposa County', label:'population: 17,500', wrap: 150},
        data: {x: -8.6001925661647, y:-17.8397274688942},
        type: d3.annotationCalloutCircle,
        dy: 40,
        dx: -40,
        subject: {
            radius: ring_radius,
            radiusPadding: ring_padding
        }
    }
]

///////////////////////// Example counties to use during heatmap scenes /////////////////////////
let annotation_counties = [
    {
        className: 'annotation-note',
        note: { title: 'LA County, CA', label: 'population: 5,8 million', wrap: 200 },
        data: { x: -23.5207679342487, y: 12.1798927351492, county: 'Los Angeles', state: 'CA' },
        type: d3.annotationCallout,
        dx: -130,
        dy: 20,
    }, {
        className: 'annotation-note',
        note: { title: 'Cook County, IL', label: 'population: 3,2 million', wrap: 200 },
        data: { x: -23.1800772869981, y: 10.9687200584552, county: 'Cook', state: 'IL' },
        type: d3.annotationCallout,
        dx: -120,
        dy: 70,
    }, {
        className: 'annotation-note',
        note: { title: 'Maricopa County, AZ', label: 'population: 2.8 million', wrap: 200 },
        data: { x: -21.3039975947282, y: 4.64500788475697, county: 'Maricopa', state: 'AZ' },
        type: d3.annotationCallout,
        dx: -130,
        dy: 80,
    }, {
        className: 'annotation-note',
        note: { title: 'Harris County, TX', label: 'population: 2.6 million', wrap: 200 },
        data: { x: -22.4467731420694, y: 14.1333846326255, county: 'Harris', state: 'TX' },
        type: d3.annotationCallout,
        dx: -90,
        dy: -10,
    }, {
        className: 'annotation-note',
        note: { title: 'Miami-Dade County, FL', label: 'population: 2.2 million', wrap: 200 },
        data: { x: -23.2134660707166, y: 17.8163281056812, county: 'Miami-Dade', state: 'FL' },
        type: d3.annotationCallout,
        dx: -20,
        dy: -100,
    }, {
        className: 'annotation-note',
        note: { title: 'Kings County, NY', label: 'population: 1.8 million', wrap: 200 },
        data: { x: -24.5872039939001, y: 16.7522605860382, county: 'Kings', state: 'NY' },
        type: d3.annotationCallout,
        dx: -80,
        dy: -40,
    }, {
        className: 'annotation-note',
        note: { title: 'Mellette County, SD', label: 'population: 851', wrap: 200 },
        data: { x: -4.52003867662281, y: -7.08917059441296, county: 'Mellette', state: 'SD' },
        type: d3.annotationCallout,
        dx: -170,
        dy: 160,
    }, {
        className: 'annotation-note',
        note: { title: 'Issaquena County, MS', label: 'population: 421', wrap: 200 },
        data: { x: -16.3326750364965, y: 29.8486160202432, county: 'Issaquena', state: 'MS' },
        type: d3.annotationCallout,
        dx: 20,
        dy: -60,
    }, {
        className: 'annotation-note',
        note: { title: 'Esmeralda County, NV', label: 'population: 418', wrap: 200 },
        data: { x: 16.8682002778854, y: 6.60359402817691, county: 'Esmeralda', state: 'NV' },
        type: d3.annotationCallout,
        dx: 90,
        dy: -40,
    }, {
        className: 'annotation-note',
        note: { title: 'Petroleum County, MT', label: 'population: 319', wrap: 200 },
        data: { x: 24.3424864012582, y: -24.75524617176, county: 'Petroleum', state: 'MT' },
        type: d3.annotationCallout,
        dx: -60,
        dy: 100,
    }, {
        className: 'annotation-note',
        note: { title: 'San Juan County, CO', label: 'population: 317', wrap: 200 },
        data: { x: 1.28646976694661, y: -28.9850530566916, county: 'San Juan', state: 'CO' },
        type: d3.annotationCallout,
        dx: -80,
        dy: 30,
    }, {
    //     className: 'annotation-note',
    //     note: { title: 'Kenedy County, TX', label: 'population: 121', wrap: 200 },
    //     data: { x: 0.444532157821985, y: 26.4051466293753, county: 'Kenedy', state: 'TX' },
    //     type: d3.annotationCallout,
    //     dx: 60,
    //     dy: -50,
    // }, {
        className: 'annotation-note',
        note: { title: 'Richmond County, VA', label: 'population: 5,300', wrap: 200 },
        data: { x: -6.95861203422274, y: 19.2728286204037, county: 'Richmond', state: 'VA' },
        type: d3.annotationCallout,
        dx: 90,
        dy: -190,
    }, {
        className: 'annotation-note',
        note: { title: 'Little River County, AR', label: 'population: 10,500', wrap: 200 },
        data: { x: 1.25562695432241, y: 19.5714014122134, county: 'Little River', state: 'AR' },
        type: d3.annotationCallout,
        dx: 120,
        dy: -80,
    },
]