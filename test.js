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

    async check_answer(e) {
        let current = this.current_country.textContent;
        let answer = e.target.innerHTML;
        let correct_answer = this.country_profiles[current].capital;
        (answer === correct_answer) ? await animations.result_anim(true) : await animations.result_anim(false);
        let index = this.countries_left.indexOf(current);
        this.countries_left.splice(index,1);
        if(this.countries_left.length===0){
            document.getElementById("answer_section").classList.add("moved");
        } else{
            this.get_four_unique_countries();
            TweenMax.staggerTo(".answer", 1, {opacity:1, delay:0.5}, 0.25);
            TweenMax.staggerFrom(".answer", 1, {x:-50, delay:0.5}, 0.25);
        }
    }
}

const set_up = {
    continent_listener_class: Array.from(document.getElementsByClassName("selectClass")),
    stats_btn : document.getElementById("stats_btn"),
    all_selection: document.querySelector(".all"),
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
        this.stats_btn.addEventListener("click", this.return_to_selection.bind(this));
    },

    return_to_selection(){
        document.getElementById("answer_section").classList.remove("moved");
        document.getElementById("selection").classList.remove("moved");
        this.all_continent_options.map(it=>it.checked=false);
        this.checked_continents = [];
        this.checked_regions = [];
        this.all_region_options.map(it=>it.checked=false);
        this.all_selection.checked=false;
        countries.country_profiles = {};
        countries.countries_left = [];
        countries.country_names = [];
        countries.current_country;
    },

    get_selection(){
        this.get_checked(this.all_continent_options, this.checked_continents);
        this.get_checked(this.all_region_options, this.checked_regions);
        // make sure there are always at least four countries in the checked_regions array
        (this.checked_regions.length===1 && this.checked_regions[0]==='north_america') && this.checked_regions.push('central_america');
        (this.checked_regions.length===1 && this.checked_regions[0]==='new_zealand_and_australia') && this.checked_regions.push('polynesia');
        if(this.checked_continents.length===0 || this.checked_regions.length===0){
            alert('select at least one continent and one region');
        } else{
            this.get_countries();
        }
    },

    async get_countries() {
        let coun;
        await fetch('./population.json')
        .then(res => res.json())
        .then(output => {
           
        coun = output;
        })
        Object.entries(coun).forEach((entry)=>{
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
        // await animations.move_section();
        document.getElementById('selection').classList.add('moved');
        countries.country_names = countries.names_array();
        countries.countries_left = countries.names_array();
        TweenMax.staggerTo(".answer", 1, {opacity:1, delay:0.5}, 0.25);
        TweenMax.staggerFrom(".answer", 1, {x:-50, delay:0.5}, 0.25);
        countries.get_four_unique_countries();
    },

    get_checked(arr1, arr2){ 
        arr1.map((it)=>(it.checked) && arr2.push(it.value))
    },

    show_sub_class(e){
        let elem = e.target;
        if(elem.classList.contains('all') && elem.checked){
            elem.checked=false
            this.all_continent_options.map((it)=>it.checked=true);
            this.all_region_options.map((it)=>{
                it.checked=true;
                it.disabled=false;
            })
        } else if (elem.classList.contains('all') && !elem.checked) {
            elem.checked=true;
            this.all_continent_options.map((it)=>it.checked=false);
            this.all_region_options.map((it)=>{
                it.checked=false;
                it.disabled=true;
            })
        } else {
            this.all_selection.checked = false;
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
}

const animations = {
    selection : document.getElementById("selection"),
    answer_section : document.getElementById("answer_section"),


    move_section(){ 
        // return new Promise(resolve => {
        //     TweenMax.to(this.selection, 0.5, {css:{y:'100%'}});
        //     TweenMax.to(this.answer_section, 0.5, {css:{y:0}, delay:0.1});
        //     setTimeout(() => {
        //       resolve('');
        //     }, 1000);
        // });
    },


    show_elements(){
        console.log(
            this.selection,
            this.answer_section
        )
    },

    result_anim(res){
        if(res){
            TweenMax.to("#correct", 1, {width:500, opacity:1,});
            TweenMax.to("#correct", 0.2, {width:400, delay:1});
            TweenMax.to("#correct", 1, {width:0, opacity:0, delay:1.2});
        } else {
            TweenMax.to("#wrong", 1, {width:500, opacity:1,});
            TweenMax.to("#wrong", 0.2, {width:400, delay:1});
            TweenMax.to("#wrong", 1, {width:0, opacity:0, delay:1.2});
        }
        TweenMax.to(".answer", 1, {opacity:0})
        return new Promise(resolve => {
            setTimeout(() => {
              resolve('');
            }, 2200);
        });
    },

    get_options_anim(){

    }
}

set_up.addListener();

