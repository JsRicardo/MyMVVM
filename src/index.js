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
                name: '迪丽热巴',
                time: 10
            },
            {
                name: '杨幂',
                time: 13
            }
        ]
    }
})

