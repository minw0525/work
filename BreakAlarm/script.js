const currTimeEl = document.getElementById('currTime');
const leftTimeEl = document.getElementById('leftTime')
const configEl = document.getElementById('config');
const leftEl = document.getElementById('left');
const modal = document.getElementById('modal')
const alarm = document.getElementById('alarm')
const worker = new Worker('worker.js')
 
let currDate;
let inputValues;
let alarmOn = false;
let routineStarted = false;
let startTime;
let workOrBreak = 0;

const getLongTimeString = (date)=>{
    const intl = new Intl.DateTimeFormat('kr',{hourCycle:'h23', hour: "numeric", minute: "numeric", second: "numeric"}).format(date);
    return intl
}

const getLeftTimeString = (startTime)=>{
    let diff = startTime - currDate
    const hh = Math.floor(diff / 1000 / 60 / 60);
    diff -= hh * 1000 * 60 * 60;
    const mm = Math.floor(diff / 1000 / 60);
    diff -= mm * 1000 * 60;
    const ss = Math.floor(diff / 1000);
    diff -= ss * 1000;
    leftTimeStr = (hh?`${hh}시 ${mm}분 ${ss}초`: mm?`${mm}분 ${ss}초`:`${ss}초`)
    // console.log(leftTimeStr)
    return leftTimeStr
}

document.forms[0].addEventListener('submit', (e)=>{
    e.preventDefault();

    if(window.Notification && Notification.permission !== "granted"){
        Notification.requestPermission()
    }
    
    currDate = new Date()

    if (!alarmOn) {
        const [startTimeEl, workMinEl, breakMinEl] = document.forms[0].elements;
        inputValues = [ startTimeEl, workMinEl, breakMinEl].map(el=>{return el.value})
        const [startHour, startMin] = inputValues[0].split(':')
        startTime = new Date();
        startTime.setHours(startHour)
        startTime.setMinutes(startMin)
        startTime.setSeconds(0)
        if (startTime > currDate) {
            setAlarm()
        }else{
            displayModal('설정 시간이 현재 시간보다 이전입니다.')
        }
        // console.log(inputValues)
    }
    else{
        resetAlarm()
    }
})

const setAlarm = ()=>{
    alarmOn = true;
    configEl.style.display = 'none';
    leftEl.style.display = 'flex';
    btn.classList.add("btnClicked");
    btn.innerHTML = '재설정'    
    renderPage()
}

const resetAlarm = ()=>{
    alarmOn = false;
    configEl.style.display = 'flex';
    leftEl.style.display = 'none';
    btn.classList.remove("btnClicked");
    btn.innerHTML = '알람 시작'
}


const renderPage = ()=>{
    currDate = new Date()
    const currTimeIntl = getLongTimeString(currDate)
    currTimeEl.innerHTML = currTimeIntl

    if (alarmOn){
        const currHour = `0${currDate.getHours()}`.substring(-2)
        const currMin = currDate.getMinutes()

        if ( currDate > startTime ){
            if (!routineStarted){
                // console.log('routine started')
                workOrBreak = 1
                routineStarted = true;
            }
            if (routineStarted) {
                // console.log(startTime.getMinutes(), Number(inputValues[workOrBreak % 2?workOrBreak % 2:2]) )
                const wOb = workOrBreak % 2?workOrBreak % 2:2
                const duration = Number(inputValues[wOb])
                startTime.setMinutes( startTime.getMinutes() + duration )
                alarmRing(duration, wOb)
                workOrBreak ++
            }
        }

        leftTimeEl.innerHTML = getLeftTimeString(startTime)

    }    
}


worker.addEventListener('message', (e)=>{
    renderPage()
    console.log(e)
})

const alarmRing = (duration, wOb)=>{
    alarm.play()
    notify(duration, wOb)
}

let timeout;
const displayModal = (str)=>{
    modal.innerHTML = ''
    let el = document.createElement('div')
    el.classList.add('msg')
    modal.appendChild(el)
    clearTimeout(timeout)
    el.textContent =  str
    el.style.display = 'flex'
    el.style.opacity = 1
    timeout = setTimeout(()=>{
      el.style.opacity = 0
    }, 1000)
}

const notify = (duration, wOb)=>{
    const [period1, period2] = wOb === 1? [`업무 시간`, `쉬는 시간`] : [`쉬는 시간`, `업무 시간`]
    const option = {
        body: `${duration} 분 후 ${period2} 알림 예정입니다.`,
        tag: `breakAlarm`
    }
    if (Notification.permission === "granted") {
        new Notification(`${period1}입니다.`, option);
    } else {
        alert('Notification denied');
    }
}

worker.postMessage('')
