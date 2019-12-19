import Rue from "./core";

window.tt = new Rue({
    el: 'app',
    data: {
        content: 'ricardo',
        desc: {
            x: '帅',
            y: '很帅'
        },
        fans: 'many',
        list: [{
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