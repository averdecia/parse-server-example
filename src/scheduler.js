let schedule = require('node-schedule');
const moment = require('moment-timezone')
const { GetLastStatus } = require('./services/bolita')
const { GetResultByDay } = require('./services/apiData')

const REPS = 20
const INTERVAL_TIME = 1000 * 30

const TIME_ZONE = 'America/Havana'
const TIME_DAY_FORMAT = 'YYYY-MM-DD'

const StartSchedule = () => {

    let rule = new schedule.RecurrenceRule();
    // your timezone
    rule.tz = TIME_ZONE;
    
    // runs at 2pm and 10pm
    // rule.second = 0;
    // rule.minute = 0;
    rule.hour = [14, 22];
    
    // schedule
    schedule.scheduleJob(rule, async function () {
        console.info("Started", moment().tz(TIME_ZONE), new Date())
        let reps = 0
        const today = moment().tz(TIME_ZONE).format(TIME_DAY_FORMAT)
        const [result, error] = await GetResultByDay(today)
        if (error) {
            console.error("Schedule: cant get from database", error)
            return 
        }
        const interval = setInterval(async () => {
            reps++
            const updated = await GetLastStatus(today, result)
            if (reps > REPS || updated) {
                clearInterval(interval)
            }
        }, INTERVAL_TIME);
    });
}


module.exports = {
    StartSchedule
}