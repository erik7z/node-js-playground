var jp = require('jsonpath');

// const data = {
//     "store": {
//         "book": [
//             {
//                 "category": "reference",
//                 "author": "Nigel Rees",
//                 "title": "Sayings of the Century",
//                 "price": 8.95
//             }, {
//                 "category": "fiction",
//                 "author": "Evelyn Waugh",
//                 "title": "Sword of Honour",
//                 "price": 12.99
//             }, {
//                 "category": "fiction",
//                 "author": "Herman Melville",
//                 "title": "Moby Dick",
//                 "isbn": "0-553-21311-3",
//                 "price": 8.99
//             }, {
//                 "category": "fiction",
//                 "author": "J. R. R. Tolkien",
//                 "title": "The Lord of the Rings",
//                 "isbn": "0-395-19395-8",
//                 "price": 22.99,
//             }
//         ],
//         "bicycle": {
//             "color": "red",
//             "price": 19.95
//         }
//     }
// }

// const result = jp.query(data, '$..book..category');
// var result = jp.paths(data, '$..author'); // ?
// var result = jp.nodes(data, '$..author') // ?
// var result = jp.value(data, '$..book[2]') // get from data
// var result = jp.value(data, '$..book[2].author', 'Dollar') // set to template
// console.log(result)
// console.log(data.store.book[2])


const profileData = {
    name: "Vasya",
    "client_info:ekb_id": "banana",
    pets:{
        total: 3,
        dogs: [
            {
                name: "fluffy",
                eats: ['meat', 'fish'],
                friends: [
                    {
                        name: "rocky",
                        eats: ['mouse', 'rat']
                    }
                ]
            },
            {
                name: "jumbo",
                eats: ['potato'],
                friends: [
                    {
                        name: "darcy",
                        eats: ['whiskas', 'rat']
                    }
                ]
            }
        ],
        cats: [
            {
                name: "meow",
                friends: [
                    {
                        name: "eow",
                    }
                ]
            },
            {
                name: "willy",
                friends: [
                    {
                        name: "qru",
                    }
                ]
            }
        ]
    },
    location: {
        country: "Cameron",
        address: "banana str 1"
    },
    contacts: {
        mobile: [
            {
                code: "+38",
                phone: "0932560609"
            },
            {
                code: "+7",
                phone: "9876543210"
            }
        ]
    },
    relatives: [
        {
            name: "Jessie Vega",
            age: "45"
        },
        {
            name: "Sugarfree",
            surname: "Orbit",
            ocupation: "dentist"
        }
    ],
}

const documentData = {
    fullname: "",
    "prod_info:product_code_task": "",
    approved_in_areas: [
    ],
    main_contact: "",
    secondary_contact: "",
    members: [
    ],
    animalFriends: [

    ]
}

const mapping_rules = [
    {from_path: '$["client_info:ekb_id"]', to_path: '$["prod_info:product_code_task"]'},
    // {from_path: "$.location.country", to_path: "$.approved_in_areas[0].country"},
    // {from_path: "$.relatives[*].name", to_path: "$.members[*].nick"},
    // {from_path: "$.pets.dogs[*].friends[*].name", to_path: "$.animalFriends[*].near.cat[*].name"},
    // {from_path: "$.contacts.mobile[0].code+$.contacts.mobile[0].phone", to_path: "$.main_contact"},
    // {from_path: "$.contacts.mobile[1].code+$.contacts.mobile[1].phone", to_path: "$.secondary_contact"},

]

mapping_rules.forEach(({from_path, to_path}) => {
    const isConcatenated = from_path.includes('+')
    if(isConcatenated) {
        const paths_arr = from_path.split('+')
        const values = paths_arr.map(path => jp.value(profileData, path))
        jp.apply(documentData, to_path, () => values.join(' '));

    } else {
        // const value = jp.value(profileData, from_path)
        // jp.apply(documentData, to_path, () => value);
        const values = jp.query(profileData, from_path)
        if(values.length) {
            if(values.length > 1) {
                values.forEach((i_value, i) => {
                    let i_path = to_path.replace('*', i)
                    i_path = i_path.replace(/\*/g, 0)
                    jp.value(documentData, i_path, i_value)
                })
            } else {
                // jp.apply(documentData, to_path, () => values.pop());

                jp.value(documentData, to_path, values.pop())
            }
        }
    }

    // jp.value(documentData, to_path, value)
})

console.log('%o', documentData)

// console.log(jp.query(profileData, '$.relatives[*].name'))
// console.log(jp.query(profileData, '$.contacts.mobile'))
// console.log(jp.value(documentData, '$.members[0].nick', 'banana'))
// console.log(documentData.members)

// console.log(jp.query(profileData, '$.pets.dogs[*].friends[*].name'))
// console.log(jp.value(documentData, '$.members[*].nick', 'banana'))
// console.log(jp.parse('$.pets.dogs[*].friends[*].name'))
// console.log(documentData)


// const documentData = {
//     fullname: "",
//     approved_in_areas: [
//         {
//             country: "",
//             address: ""
//         },
//         {
//             country: "",
//             address: ""
//         }
//     ],
//     main_contact: "",
//     secondary_contact: "",
//     members: [
//         {
//             name: "",
//             surname: "",
//             age: "",
//             ocupation: "",
//             nationality: ""
//         }
//     ]
// }
