const countries = {
    country_profiles: {},
    country_names: [],
    countries_left: [],
    current_country: document.getElementById("country"),
    answers: Array.from(document.getElementsByClassName("answer")),

    names_array() { 
        let arr = [];
        Object.keys(this.country_profiles).forEach(key=>arr.push(key));
        return arr;
    },

    get_random_index(array) { return Math.floor(Math.random()*array) }, 

    add_listener() {
        this.answers.map((it)=>{it.addEventListener("click", this.check_answer.bind(this))});
    },

    shuffle(array) {
        let counter = array.length;
        while (counter > 0) {
            let index = Math.floor(Math.random() * counter);
            counter--;
            let temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }
        return array;
    },

    get_four_unique_countries() {
        let countries = [];
        let arr1 = this.countries_left;
        let arr2 = this.country_names;
        countries.push(arr1[this.get_random_index(arr1.length)]);
        let correct_country = countries[0];
        while(countries.length!==4){
            let country = arr2[this.get_random_index(arr2.length)];
            (!countries.includes(country)) && countries.push(country);
        }
        countries = this.shuffle(countries);
        this.create_question([countries, correct_country]);
        console.log(countries);
        return [countries, correct_country];
    },

    create_question(arr) {
        this.current_country.innerHTML = arr[1];
        let selec = [];
        Object.entries(this.country_profiles).forEach(entry=>{
            (arr[0].includes(entry[0])) && selec.push(entry);
        })
        selec = this.shuffle(selec);
        for(i=0;i<selec.length;i++){
            this.answers[i].innerHTML = selec[i][1].capital;
        }
    },

    check_answer(e) {
        let current = this.current_country.textContent;
        let answer = e.target.innerHTML;
        let correct_answer = this.country_profiles[current].capital;
        (answer === correct_answer) ? alert("correct!") : alert("false");
        let index = this.countries_left.indexOf(current);
        this.countries_left.splice(index,1);
        if(this.countries_left.length===0){
            alert('no countries left');
        } else{
            this.get_four_unique_countries();
        }
        animations.show_elements();
    }
}

const set_up = {
    continent_listener_class: Array.from(document.getElementsByClassName("selectClass")),
    selection_btn: document.getElementById("select_button"),

    all_continent_options: Array.from(document.getElementsByClassName("selectClass")),
    all_region_options: Array.from(document.getElementsByClassName("sub_cat")),
    checked_continents: [],
    checked_regions: [],
    
    addListener() {
        this.continent_listener_class.map((it)=>{
            it.addEventListener("change", this.show_sub_class.bind(this))
        })
        this.selection_btn.addEventListener("click", this.get_selection.bind(this));
        countries.add_listener();
    },

    get_selection(){
        this.get_checked(this.all_continent_options, this.checked_continents);
        this.get_checked(this.all_region_options, this.checked_regions);
        this.get_countries();
    },

    async get_countries() {
        let coun;
        await fetch('./population.json')
        .then(res => res.json())
        .then(output => {
           
        coun = output;
        })
        console.log(coun);
        /*Object.entries(coun).forEach((entry)=>{
            let continent = entry[0];
            (this.checked_continents).includes(entry[0]) && Object.entries(entry[1].regions).forEach((entry)=>{
                let region = entry[0];
                (this.checked_regions).includes(entry[0]) && Object.entries(entry[1].countries).forEach((entry)=>{
                    countries.country_profiles[entry[0]] = {
                        region: region,
                        capital: entry[1].capital,
                        continent : continent,
                    };
                });
            });
        });
        await animations.move_section();
        countries.country_names = countries.names_array();
        countries.countries_left = countries.names_array();
        countries.get_four_unique_countries();
    },

    get_checked(arr1, arr2){ 
        arr1.map((it)=>(it.checked) && arr2.push(it.value))*/
    },

    show_sub_class(e){
        let elem = e.target;
        (elem.checked) && (!elem.checked);
        let a = Array.from(elem.nextElementSibling.children);
        a = a.filter(it=>(it.classList.contains("sub_cat")));
        if(!elem.checked){
            a.map(it=>it.disabled=true);
            a = a.map(it=>it.checked=false);

        } else {
            a.map(it=>it.disabled=false);
        }
    }
}

const animations = {
    selection : document.getElementById("selection"),
    answer_section : document.getElementById("answer_section"),


    move_section(){ 
        return new Promise(resolve => {
            TweenMax.to(this.selection, 0.5, {css:{transform:'translate(-50%, -500%)'}});
            TweenMax.to(this.answer_section, 0.5, {css:{transform:'translate(-50%, -50%'}, delay:0.1});
            setTimeout(() => {
              resolve('');
            }, 1000);
        });
    },

    show_elements(){
        console.log(
            this.selection,
            this.answer_section
        )
    }
}

// SEARCH BAR

// document.getElementById("search_field").addEventListener("keyup", get_country_list);

// async function get_country_list(e){
//     let value = e.target.value;
//     let country_list = [];
//     let filtered_list = [];
//     await fetch('./population.json')
//         .then(res => res.json())
//         .then(output => {
//         country_list = output;
//         })
//     Object.entries(country_list).forEach((entry)=>{
//         Object.entries(entry[1].regions).forEach((entry)=>{
//             Object.keys(entry[1].countries).forEach((key)=>{
//                 (key.includes(value)) && filtered_list.push(key);
//             })
//         })
//     })
//     let list = "";
//     filtered_list.map(it=> {
//         list +=`<li>${it}</li>`;
//     });
//     let ul = document.getElementById("suggestion_list");
//     ul.innerHTML = list;
// }

//countries.get_four_unique_countries();
//set_up.addListener();
