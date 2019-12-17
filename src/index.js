import Rue from "./core";

window.tt = new Rue({
    el: 'app',
    data: {
        content: 'ricardo',
        desc: '很帅',
        dec: {
            x: 1,
            y: 2
        },
        list: [
            {
                name: 'haha',
                age: 12
            },
            {
                name: 'ee',
                age: 13
            }
        ]
    }
})
