let gold = $(".gold_span");
let exp = $(".exp_span");
$('.spawn-friend-soldier').click(function(){
    let gold_js = parseInt(gold.html());
    if (gold_js >= 10){
        gold_js -=10;
        gold.html(gold_js);
        spawn_queue('soldier','friend')
    }
});
    
$('.spawn-enemy-soldier').click(function(){spawn_queue('soldier','enemy')});
$('.spawn-friend-archer').click(function(){
    let gold_js = parseInt(gold.html());
    if (gold_js >= 20){
        gold_js -=20;
        gold.html(gold_js);
        spawn_queue('archer','friend');
    }    
});
$('.spawn-enemy-archer').click(function(){spawn_queue('archer','enemy')});

let enemy_gold = 0;


let intervargold = setInterval(function(){
    let gold_js = parseInt(gold.html());
    gold_js = gold_js + 1 ;
    gold.html(gold_js);
    enemy_gold = enemy_gold +1;
    if (enemy_gold > 50){
        enemy_gold -= 50;
        $('.spawn-enemy-soldier').click();
        $('.spawn-enemy-soldier').click();
        $('.spawn-enemy-soldier').click();
        $('.spawn-enemy-soldier').click();
        $('.spawn-enemy-soldier').click();
    }
    else if (enemy_gold > 20){
        let d = Math.random();
        if (d < 0.7){
            //
        }
        else if (d < 0.9){
            enemy_gold -= 10;
            spawn_queue('soldier','enemy')
        }
            
        else{
            enemy_gold -= 20;
            spawn_queue('archer','enemy')
        }      
    }
},250);
let intervalexp = setInterval(function(){
    let exp_js = parseInt(exp.html());
    exp_js = exp_js + 1;
    exp.html(exp_js);
},1000);



