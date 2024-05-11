(function() {
    document.addEventListener("DOMContentLoaded", (event) => {
        populateData();
        document.getElementById("show-how-tos").checked=true;
        // trigger tooltip
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
        
        let modal = new bootstrap.Modal("#import-data-from-save");
    });

    let populateData = () => {
        // untick all boxes first
        checklist.forEach((e) => {
            e.checked=false;
            if (document.getElementById("collapse-"+e.id)){
                let collapse = new bootstrap.Collapse('#collapse-'+e.id, {toggle: false});
            }
        });

        let data = getData();
        if (!data) {
            uncollapseUntickCheckbox();
            return;
        }
        data.forEach(e => {
            let id = e.toLowerCase().replace("_","-");
            let el = document.getElementById(id);
            if (el != undefined){
                el.checked = true;
            }
        })
        uncollapseUntickCheckbox();
    };

    let uncollapseUntickCheckbox = (id) => {
        if(id != undefined) {
            let checked = document.getElementById(id).checked;
            if (document.getElementById("collapse-"+id) == undefined){
                return;
            }
            let ce = bootstrap.Collapse.getInstance("#collapse-"+id);
            if (ce == undefined) {
                return;
            }
            checked ? ce.hide() : ce.show();
        } else {
            checklist.forEach((e) => {
                uncollapseUntickCheckbox(e.id);
            });
        }
    };

    document.getElementById('clear-cache').addEventListener('click', (e) => {
        clearCache();
    });

    let clearCache = () => {
        checklist.forEach((e) => {
            e.checked=false;                
            uncollapseUntickCheckbox(e.id);
            localStorage.removeItem(localStorageKey);
        });
    };

    document.getElementById('file-import').addEventListener('change', (e) => {
        if (e.target.files.length <= 0) {
            return;
        }
        e.target.files.item(0)
            .text()
            .then(e => {
                populateDataFromFile(e);
                let modal = bootstrap.Modal.getInstance("#import-data-from-save");
                if (modal != undefined){
                    modal.hide();
                }
            })
            .catch((e)=>console.error(e));
    });

    let populateDataFromFile = text =>{
        checklist.forEach(e => {
            let key = "objective." + e.value.toLowerCase();
            let checked = text.includes(key);
            if (e.checked != checked) {
                e.checked = true;
                setData(e.value, e.id, e.checked);
                uncollapseUntickCheckbox(e.id);
            }
        });
    };

    document.getElementById('show-how-tos').addEventListener('click', e => {
        let cards = document.getElementsByClassName('card');
        let checked = e.target.checked;
        Array.prototype.forEach.call(cards, c => {
            if(checked) {
                c.classList.remove("visually-hidden");
                uncollapseUntickCheckbox(e.id);
            } else {
                c.classList.add("visually-hidden");
            }
        });
    });

    let click = (value, id, checked) => {
        if (value == '' || value == undefined || id == '' || id == undefined || checked == undefined) {
            return
        }
        setData(value, checked);
        uncollapseUntickCheckbox(id);
    }

    const localStorageKey = "theredlanternjournal";
    const checklist = document.querySelectorAll('[id^=obj-]');
    checklist.forEach((e) => {
        e.addEventListener('click', (e) => {
            click(e.target.value, e.target.id,e.target.checked)
        });
    });

    let addNewData = (data, item,checked) => {
        let idx = data.indexOf(item);
        if((checked && idx != -1) || (!checked && idx == -1)){
            return undefined;
        } else if(checked && idx == -1) { // data is not in local storage, append
            data.push(item);
        } else if (!checked && idx !=-1) { // data is in local storage, remove
            data.splice(idx, 1);
        }
        return data;
    };

    let setData = (item, checked) => {
        if (item == undefined){
            return;
        }
        let data = getData();
        data = (data) ? data : [];
        data = addNewData(data,item,checked);
        if (data == undefined) {
            return;
        }               
        data = JSON.stringify(data);
        localStorage.setItem(localStorageKey,data);
    };

    let getData = (item) => {
        let ls = JSON.parse(localStorage.getItem(localStorageKey));
        if (ls == undefined){
            return false;
        }
        if(item == undefined) {
            return ls;
        }
        if (item.indexOf(item) != -1){
            return true;
        }
    };
})();