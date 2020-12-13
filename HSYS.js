// HSYS, HSYSTimes

class HSYS
{
    constructor(hour=-1, minute=-1) //ex) 4digit === 1030 means 10:30 in time
    {
        this.hour = hour
        this.minute = minute
    }

    TotalMinutes()
    {
        if (isInitialized())
        {
            return this.hour * 60 + this.minute;
        }
        return 0;
    }

    addMMSS(MMSS)
    {
        if (MMSS <= 0)
        {
            return;
        }

        const min = MMSS / 100;
        const seconds = MMSS % 100 + min * 60;

        this.addSeconds(seconds);

    }

    addSeconds(seconds)
    {
        if (seconds <= 0)
            return;
        let min = (seconds - 1) / 60;
        min++;
        this.addMin(min);
    }

    isInitialized()
    {
        return this.hour != -1 && this.minute != -1;
    }

    //minutes is string
    setByMinutes(minutes)
    {
        let min = parseInt(minutes);
        let hour = min / 60;
        min = min % 60;
        this.minute = min;
        this.hour = hour;
    }

    //_4digit is string
    set4digit(_4digit)
    {
        if (_4digit.Length != 4)
        {
            return;
        }
        const digit = parseInt(_4digit);
        this.hour = digit / 100;
        this.minute = digit % 100;
    }

    _UpdateMinHr()
    {
        while (this.minute >= 60)
        {
            this.hour++;
            this.minute -= 60;
        }

        while (this.minute < 0)
        {
            this.hour--;
            this.minute += 60;
        }
    }

    addMin(min)
    {
        this.minute += min;
        _UpdateMinHr();
        return this;
    }

    subMin(min)
    {
        this.minute -= min;
        _UpdateMinHr();
        return this;
    }

    static add(lhs, rhs)
    {
        const totMin = lhs.minute + rhs.minute;
        const totHour = lhs.hour + rhs.hour;

        return new HSYS(totHour, totMin)
    }

    static sub(lhs, rhs)
    {
        const totMin = lhs.minute - rhs.minute;
        const totHour = lhs.hour - rhs.hour;

        return new HSYS(totHour, totMin)
    }

    ToString(filler = "")
    {
        const hr = this.hour.toString().padStart(2, '0');
        const m = this.minute.toString().padStart(2, '0');
        return hr + filler + m;
    }

    ToInt()
    {
        return ((this.hour * 100) + this.minute);
    }

    ToHS(filler = " ")
    {
        return this.hour.toString() + "h" + filler + this.minute.toString() + "m";
    }
}

class HSYSTimes
{
    constructor()
    {
        this.g_LS = new HSYS();
        this.g_RB = new HSYS();
        this.g_LB = new HSYS();
        this.g_RS = new HSYS();
        this.g_TDT = new HSYS();
        this.g_TTD = new HSYS();
        this.g_EstRB = new HSYS();
        this.g_TBT = new HSYS();
        this.g_R1st_Stop = new HSYS();
        this.g_DCompStop_Leave = {}
        this.g_DCompStop_Reach = {}
    }
}