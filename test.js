window.onload = function(){
        setup.add_listeners();
}

class Country {
    constructor(continent, region, country, capital){
        this.continent = continent;
        this.region = region;
        this.country = country;
        this.capital = capital;
        this.exclude = ["and", "the", "of", "la", "au"];
    };

    modify_string(attr){
        let name_array, name;  
        name_array = this[attr].split("_");
        name_array = name_array.map(it=>{
            return ((!this.exclude.includes(it)) ? it[0].toUpperCase() + it.slice(1) : it)
        })
        name = name_array.join(" ");
        return name;
    };

    get_elem(elem){
        return this.modify_string(elem);
    }
}

const countries = {
    answer_loc : Array.from(document.getElementsByClassName("answer")),
    country_loc : document.getElementById("country"),
    country_list: undefined,
    country_names: undefined,
    countries_left: undefined,
    current_country: undefined,
    answers: undefined,

    fill_arrays(){
        this.country_names = this.country_list.map(it=>it.get_elem("country"));
        this.countries_left = this.country_names;
    },

    random_index(arr){
        const length = arr.length
        return Math.floor(Math.random()*length);
    },

    get_random_country(){
        const index = this.random_index(this.country_list);
        const country_name = this.countries_left[index];
        this.current_country = this.country_list.filter(it=>{
            return (it.get_elem("country")===country_name)
        })[0];
    },

    get_random_array(){
        let array = [this.current_country.get_elem("capital")];
        const region_arr = this.country_list.filter(it=>{
            return (it.get_elem("region")===this.current_country.get_elem("region"))
        });
        const continent_arr = this.country_list.filter(it=>{
            return (it.get_elem("continent")===this.current_country.get_elem("continent"))
        });
        while(array.length!=4){
            if(region_arr.length!=0){
                array.push(region_arr[this.random_index(region_arr)].get_elem("capital"));
            } else {
                array.push(continent_arr[this.random_index(continent_arr)].get_elem("capital"));
            }
        }
        this.answers = this.shuffle(array);
    },

    place_question(){
        if(this.countries_left!=0){
            this.get_random_country();
            this.get_random_array();
            this.add_answers();
            animations.move_select();
            animations.show_answers();
        }else{
            alert("no more countries");
        }
    },

    add_answers(){
        this.answer_loc.map((it, i)=>it.innerHTML = this.answers[i]);
        this.country_loc. innerHTML = this.current_country.get_elem("country");
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

    async check_answer(e){
        const answer = e.target.textContent;
        if(answer===countries.current_country.get_elem("capital")){
            animations.correct()
        } else {
            animations.wrong()
        }
        animations.hide_answers();
        await animations.pause(3000);
        countries.place_question();
    }
}

const setup = {
    answers_loc: Array.from(document.getElementsByClassName("answer")),
    all_continents_check: Array.from(document.getElementsByClassName("selectClass")),
    all_regions_check: Array.from(document.getElementsByClassName("sub_cat")),
    all_check: document.querySelector(".all"),
    start_btn: document.getElementById("start_btn"),
    checked_continents: undefined,
    checked_regions: undefined,
    is_checked: undefined,
    data: undefined,

    add_listeners(){
        this.all_continents_check.map((it)=>{
            it.addEventListener("change", this.toggle_sub_cat.bind(this));
        });
        this.start_btn.addEventListener("click", this.start_quiz.bind(this));
        this.answers_loc.map(it=>it.addEventListener("click", countries.check_answer.bind(this)));
    },

    check_all(){
        this.all_continents_check.map(it=>it.checked=this.is_checked);
        this.all_regions_check.map((it)=>{
            it.checked = this.is_checked;
            it.disabled = !this.is_checked;
        })
    },

    specific_check(elem){
        this.all_check.checked = false;
        let children = Array.from(elem.nextElementSibling.children);
        children = children.filter(it=>it.classList.contains("sub_cat"));
        if(this.is_checked){
            children.map(it=>it.disabled=!this.is_checked);
        } else {
            children.map(it=>{
                it.disabled=!this.is_checked;
                it.checked=this.is_checked
            });
        }
    },

    toggle_sub_cat(e){
        let elem = e.target;
        this.is_checked = (elem.checked) ? true : false;
        (elem.classList.contains("all")) ? this.check_all()  :
        this.specific_check(elem);
    },

    get_checked(){
        this.checked_continents = this.all_continents_check.filter(it=>it.checked)
        .filter(it=>it.value !== "all")
        .map(it=>it.value);
        this.checked_regions = this.all_regions_check.filter(it=>it.checked).
        map(it=>it.value);

        // need to add an extra country is array is just north america or australia and new zealand
    },

    async start_quiz(){
        this.get_checked();
        if(this.checked_continents.length !== 0 || this.checked_regions.length !==0){
            this.data = await this.get_data();
        } else {
            alert("error");
        }
        countries.country_list = this.get_countries();
        countries.fill_arrays();
        countries.place_question();
    },

    get_data(){
        let data = fetch("./population.json")
        .then(res=>res.json())
        .then(output=>output)
        return data;
    },

    get_countries(){
        let country_array = [];
        Object.entries(this.data).forEach(it=>{
            const continent = it[0];
            (this.checked_continents.includes(continent)) && Object.entries(it[1].regions).forEach(it=>{
                const region = it[0];
                (this.checked_regions.includes(region)) && Object.entries(it[1].countries).forEach(it=>{
                    let country = new Country(continent, region, it[0], it[1].capital)
                    country_array.push(country);
                })
            })
        })
        return country_array;
    },
}

const animations = {
    selection: document.getElementById("selection"),
    answer_loc: Array.from(document.getElementsByClassName("answer")),
    correct_loc: document.getElementById("correct"),
    wrong_loc: document.getElementById("wrong"),


    show_answers(){
        TweenMax.staggerTo(this.answer_loc, 1, {opacity:1, delay:1}, 0.25);
    },

    hide_answers(){
        TweenMax.staggerTo(this.answer_loc, 1, {opacity:0, delay:0.3}, 0.25);
    },

    move_select(){
        TweenMax.to(this.selection, 0.5, {css:{transform:`translate(-50%,-100%)`}});
    },

    correct(){
        TweenMax.to(this.correct_loc, 1, {width:500, opacity:1,});
        TweenMax.to(this.correct_loc, 0.2, {width:400, delay:1});
        TweenMax.to(this.correct_loc, 1, {width:0, opacity:0, delay:1.2});
    },

    wrong(){
        TweenMax.to(this.wrong_loc, 1, {width:500, opacity:1,});
        TweenMax.to(this.wrong_loc, 0.2, {width:400, delay:1});
        TweenMax.to(this.wrong_loc, 1, {width:0, opacity:0, delay:1.2});
    },
    
    pause(number){
        return new Promise(resolve=>{
            setTimeout(()=>{
                resolve('')
            },number);
        })
    }
}
