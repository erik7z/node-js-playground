// #1
// var handler = {
//     get: function (target, name) {
//         return name in target ? target[name] : 37;
//     },
// };
//
// var p = new Proxy({}, handler);
// p.a = 1;
// p.b = undefined;
//
// console.log(p.a, p.b); // 1, undefined
// console.log('c' in p, p.c); // false, 37


// #2
// var target = {};
// var p = new Proxy(target, {});
//
// p.a = 47; // операция перенаправлена прокси
//
// console.log(target.a); // 47. Операция была успешно перенаправлена


// #3

let validator = {
    set: function(obj, prop, value) {
        if (prop === 'age') {
            if (!Number.isInteger(value)) {
                throw new TypeError('The age is not an integer');
            }
            if (value > 200) {
                throw new RangeError('The age seems invalid');
            }
        }

        // Стандартное сохранение значения
        obj[prop] = value;

        // Обозначить успех
        return true;
    }
};

let person = new Proxy({}, validator);

person.age = 100;
console.log(person.age); // 100
// person.age = 'young'; // Вызовет исключение
person.age = 300; // Вызовет исключение
