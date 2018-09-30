
const randomize = (adjustable_num, default_num)=>{
    let distinct_num = [], double_num = []
    for (let i=0; i<default_num; i++){
        if (i<adjustable_num) distinct_num.push(i)
        else  distinct_num.push(Math.floor((Math.random() * adjustable_num) + 1))
    }
    double_num = distinct_num.concat(distinct_num)
    for (let i = double_num.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [double_num[i], double_num[j]] = [double_num[j], double_num[i]];
    }
    return double_num
}

export default randomize
