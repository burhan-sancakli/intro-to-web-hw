//<core>
String.prototype.format = function() {
    a = this;
    for (k in arguments) {
      a = a.replace("{" + k + "}", arguments[k])
    }
    return a
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};


function int(x){
    return parseInt(x);
}
//</core>




//<game>

let age=0;
let friend_units=[];
let friend_turrets=[];
let enemy_units=[];
let enemy_turrets=[];

let units=[friend_units,enemy_units];

let f_speed_modifier=1;
let e_speed_modifier=1;

function get_character_stats(character,by_unit){
    // Gets the stat of the unit.
    // We can also perform character_stats.s_0_0.hp;
    let variation=0;
    if(by_unit){
        character=character.find('#name').val();
    }
    return character_stats["{0}_{1}_{2}".format(character[0],age,variation)]; //by the first character of the name (soldier->s), we get the code name for it
}

function is_unit(object){
    // whether an object is an actual in-game unit or not.
    return object.hasClass('unit')
}

function is_character(unit){
    return unit.hasClass('character')
}

function is_soldier(unit){
    return unit.find('#name').val()[0]=='s';
}

function is_archer(unit){
    return unit.find('#name').val()[0]=='a';
}

function unit_side(unit){
    return unit.hasClass('friend') ? 'friend' : 'enemy';
}

function is_friend(unit){
    return unit.hasClass('friend')
}

function is_enemy(unit){
    return unit.hasClass('enemy')
}

function is_idle(unit){
    return unit.hasClass('idle')
}

function is_moving(unit){
    return unit.hasClass('moving')
}

function is_attacking(unit){
    return unit.hasClass('attacking')
}

function is_shooting(unit){
    return unit.hasClass('shooting')
}

function is_moving_shooting(unit){
    return unit.hasClass('moving') && unit.hasClass('shooting')
}

function is_died(unit){
    return int(unit.find('#hp').val())<=0
}




function move(unit){
    // engage_stop(unit,true); //to align shooting animation and the funch itself properly
    unit.removeClass('idle');
    unit.addClass('moving');
    const horizon_dist=1000;
    const horizon_speed=100*1000;

    let speed=get_character_stats(unit,true).speed;
    let side=unit_side(unit);
    if(side=='friend'){
        let x=int(unit.css('left'));
        let dest=screen.width;
        //let width=int(unit.css('width'));
        let dest_dist=Math.abs(x-dest);  // distance from the end of the screen.
        speed *= f_speed_modifier;  // can be increased by global buff to the friendly units.
        let animation_time=horizon_speed/speed/(horizon_dist/dest_dist);
        unit.animate({left:dest},animation_time,'linear',function(){
            // if any friendly unit goes past the end of the screen, we win.
            window.location.href="./win.html";
            die(unit);
        });
    }else{
        let x=int(unit.css('left'));
        let width=int(unit.css('width'));
        let dest=0-width;
        let dest_dist=Math.abs(x-dest);
        speed *= e_speed_modifier;
        let animation_time=horizon_speed/speed/(horizon_dist/dest_dist);
        
        unit.animate({left:dest},animation_time,'linear',function(){
            window.location.href="./lost.html";
            die(unit);
        });
    }
}

function engage_start(unit,rngd){
    if(rngd){
        // if the unit is a ranged unit like an archer, it can do its ranged attack.
        unit.addClass('shooting');
    }else{
        // if it is not a ranged unit, it will start attacking.
        unit.removeClass('shooting');
        unit.addClass('attacking');
        if(is_moving(unit)){
            stop(unit);
        }
    }
}

function engage_stop(unit,rngd){
    // stops any engagements.
    if(rngd){
        unit.removeClass('shooting');
    }else{
        unit.removeClass('attacking');
        unit.removeClass('shooting');
    }
}

function stop(unit){
    // stops the movement of the unit.
    unit.stop();
    //unit.removeClass('shooting');//to align shooting animation and the funch itself properly
    unit.removeClass('moving');
    unit.addClass('idle');
}

function die(unit){
    // allow sthe unit to die.
    let side_units= unit.hasClass('friend') ? friend_units : enemy_units;
    side_units.remove(unit);
    unit.remove();
}

function do_damage(receiver,dmg){
    // inflicts damage to the receiver.
    let r_hp=receiver.find('#hp');
    let r_hp_val=int(r_hp.val());
    if(r_hp_val<=0){
        // if hp was already below 0 or is zero, unit dies.
        die(receiver);
        return true
    }
    r_hp.val(r_hp_val-dmg);
    r_hp_val=int(r_hp.val());
    console.log('im: '+unit_side(receiver)+' and my health is now: '+(r_hp_val.toString())+'hp');
    if(r_hp_val<=0){
        // if hp is now below 0 or is zero, unit dies. This makes double checks, the one before this shouldnt be needed but anyways.
        die(receiver);
        return true
    }
    return false
}

function engage(sender,receiver,is_rngd,not_initial){
    if(is_died(sender)){
        die(sender);
        return
    }
    let char_stats=get_character_stats(sender,true);

    if(is_rngd==true){
        if(is_attacking(sender)){
            engage_stop(sender,true);
            return
        }
        if(is_died(receiver)){
            engage_stop(sender,true);
            return
        }
        let attack_start_t=char_stats.attack_start_t_rngd;
        if(!not_initial){
            if(is_shooting(sender) || is_attacking(sender)){
                return
            }
            engage_start(sender,true);
            setTimeout(function(){engage(sender,receiver,true,true)},attack_start_t);
            return
        }
        if(!is_shooting(sender)){
            return
        }
        let is_dead=do_damage(receiver,char_stats.dmg_rngd);
        if(is_dead){
            engage_stop(sender);
            return
        }
        let hit_t=char_stats.hit_t_rngd;
        setTimeout(function(){engage(sender,receiver,true,true)},hit_t);
    }else{
        if(is_shooting(sender)){
            engage_stop(sender,true);
        }
        let attack_start_t=char_stats.attack_start_t;
        if(!not_initial){
            if(is_died(receiver)){
                engage_stop(sender);
                return
            }
            engage_start(sender);
            setTimeout(function(){engage(sender,receiver,false,true)},attack_start_t);
            return
        }
        let dmg=char_stats.dmg;
        let is_dead=do_damage(receiver,dmg);
        if(is_dead){
            engage_stop(sender);
            return
        }
        let hit_t=char_stats.hit_t;
        setTimeout(function(){engage(sender,receiver,false,true)},hit_t);
    }
}

function spawn_queue(character,side){
    console.log('spawn');
    spawn_unit(character,side);
}
function spawn_unit(character,side){
    let char_stats=get_character_stats(character);
    let hp=char_stats.hp, name=char_stats.name;
    let unit=$('<div class="unit character {0} {1}"><input type=text id=name value={2} hidden=hidden><input type=text id=hp hidden=hidden value={3}></div>'.format(name,side,name,hp));
    $('.background').append(unit);
    let side_units = side == 'friend' ? friend_units : enemy_units;
    side_units.push(unit);
    move(unit);
}

function update_units(){
    // any function here causes too much lag, it should be used carefully.
}


function upd_friend(){ //[0,1,2,3,4] [rightmost,......,leftmost]
    let units_last_index=friend_units.length-1;
    if(units_last_index<0){
        return
    }
    
    let forefront=friend_units[0];  // the friend that is at the front.
    if(!is_attacking(forefront)){
        if(!is_moving(forefront)){
            move(forefront);
        }
    }
   
    for(let i = units_last_index;i>0;i--){
        // this function defines when should all the units move.
        let f=friend_units[i-1];
        let b=friend_units[i];

        if(!is_moving(f) && !is_moving(b)){continue} //optimization, if no one is moving, i shouldnt move either.

        let f_x=int(f.css('left'));
        let b_x=int(b.css('left'));
        let b_width=int(b.css('width'));

        let dist=f_x-(b_x+b_width);
        if(is_moving(b)){
            if(dist<1){
                stop(b);
            }
        }
        else{
            if (dist>=1){
                move(b);
            }
        }
    }
}

function upd_enemy(){ //[0,1,2,3,4] [leftmost,......,rightmost]
    let units_last_index=enemy_units.length-1;
    if(units_last_index<0){
        return
    }
    let forefront=enemy_units[0];
    if(!is_attacking(forefront)){
        if(!is_moving(forefront)){
            move(forefront);
        }
    }
    for(let i = units_last_index;i>0;i--){
        let f=enemy_units[i-1];
        let b=enemy_units[i];
        if(!is_moving(f) && !is_moving(b)){continue} //optimization

        let f_x=int(f.css('left'));
        let f_width=int(f.css('width'));
        let b_x=int(b.css('left'));

        let dist=b_x-(f_x+f_width);
        if(is_moving(b)){
            if(dist<1){
                stop(b);
            }
        }
        else{
            if (dist>=1){
                move(b);
            }
        }
    }
}

function upd_engagement(){
    // defines when should units engage with each other.
    let friend_last_index=friend_units.length-1;
    let enemy_last_index=enemy_units.length-1;
    let friend_exists=friend_last_index>-1,enemy_exists=enemy_last_index>-1;
    if(friend_exists && enemy_exists){
        let friend=friend_units[0];
        let friend_x=int(friend.css('left'));
        let friend_width=int(friend.css('width'));
        let enemy=enemy_units[0];
        let enemy_x=int(enemy.css('left'));

        let dist=enemy_x-(friend_x+friend_width);
        if (dist<5){
            if(!is_attacking(enemy) && !is_attacking(friend)){
                engage(enemy,friend);
                engage(friend,enemy);
            }
        }
    }
    if(enemy_exists){
        let units_last_index=friend_units.length-1;
        for(let i = units_last_index;i>=0;i--){
            let friend=friend_units[i];
            if(!is_archer(friend)){
                continue;
            }
            let friend_x=int(friend.css('left'));
            let friend_width=int(friend.css('width'));
            let enemy=enemy_units[0];
            let enemy_x=int(enemy.css('left'));

            let char_stats=get_character_stats(friend,true);

            let dist=enemy_x-(friend_x+friend_width);
            if (dist<char_stats.attack_range){
                if(!is_attacking(friend) && !is_shooting(friend)){
                    engage(friend,enemy,true);
                }
            }
        }
    }
    if(friend_exists){
        let units_last_index=enemy_units.length-1;
        for(let i = units_last_index;i>=0;i--){
            let enemy=enemy_units[i];
            if(!is_archer(enemy)){
                continue;
            }
            let enemy_x=int(enemy.css('left'));
            let friend=friend_units[0];
            let friend_x=int(friend.css('left'));
            let friend_width=int(friend.css('width'));

            let char_stats=get_character_stats(enemy,true);

            let dist=enemy_x-(friend_x+friend_width);
            if (dist<char_stats.attack_range){
                if(!is_attacking(enemy) && !is_shooting(enemy)){
                    engage(enemy,friend,true);
                }
            }
        }
    }
}


setInterval(update_units,20);

setInterval(upd_friend,100);
setInterval(upd_enemy,100);
setInterval(upd_engagement,100);
// these intervals could be raised but it only causes more lag, as units themselves aren't too fast they don't require too fast of an update cycle.



//</game>


