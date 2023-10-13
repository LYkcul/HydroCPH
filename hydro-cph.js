// ==UserScript==
// @name         Hydro-cph
// @namespace    https://github.com/LYkcul/HydroCPH
// @version      1.0.0
// @description  Hydro题目传送至cph
// @author       LYkcul
// @match        *://*/*
// @license      AGPL-3.0 license
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';
    var url = window.location.href;

    async function cph() {
        const pid = /\/p\/([^/]+)/.exec(url)[1];
        const test = [...document.querySelectorAll('pre > code')];
        let resTest = [];
        for (let i = 0; i < test.length - 1; i += 2) {
            resTest.push({
                input: test[i].textContent,
                output: test[i + 1].textContent
            })
        }
        const tmpTime = document.querySelector('.icon-stopwatch').textContent;
        const timeLimit = parseInt(/(\d+)ms/.exec(tmpTime)[1], 10);
        const tmpMemory = document.querySelector('.icon-comparison').textContent;
        const memoryLimit = parseInt(/(\d+)MiB/.exec(tmpMemory)[1], 10);

        GM_xmlhttpRequest({
            url: "http://localhost:27121/",
            method: "POST",
            data: JSON.stringify({
                batch: {
                    id: "hydroCPH",
                    size: 1
                },
                name: `Hydro_${pid}`,
                group: "Hydro",
                url: url,
                interactive: "false",
                memoryLimit: memoryLimit,
                timeLimit: timeLimit,
                tests: resTest,
                input: {
                    type: "stdin"
                },
                output: {
                    type: "stdout"
                },
                language: {
                    java: {
                        mainClass: "Main",
                        taskClass: pid
                    }
                },
                testType: "single"
            }),
            onload(f) {
                f.status === 502 && alert('cph 未启动')
            },
            onerror() {
                alert('cph 未启动')
            }
        })
    }

    async function HydroCPH() {
        const cphL = document.createElement('li');
        cphL.className = 'menu__item nojs--hide';
        const cphA = document.createElement('a');
        cphA.className = 'menu__link';
        cphA.setAttribute('name', 'problem-cph');
        const cphS = document.createElement('span');
        cphS.className = 'icon icon-send';
        const text = document.createTextNode('传送至 cph');

        cphA.appendChild(cphS);
        cphA.appendChild(text);
        cphL.appendChild(cphA);

        const pos = document.querySelector('.menu');
        //console.log(pos.textContent);
        pos.appendChild(cphL);

        cphL.addEventListener('click', async function () {
            await cph();
        });
    }

    const pageInfo = document.querySelector('html');
    if (pageInfo) {
        const dataApp = pageInfo.getAttribute('data-app');
        const dataPage = pageInfo.getAttribute('data-page');
        if (dataApp && dataPage && dataApp === "Hydro" && (dataPage === "problem_detail" || dataPage.includes("detail_problem"))) {
            window.addEventListener('load', HydroCPH);
        }
    }
})();