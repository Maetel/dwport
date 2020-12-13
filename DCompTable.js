const GasMix = Object.freeze({"NONE":0, "AIR":1, "AIRO2":2})


class DCompRow
{
    /*
    public int m_BottomTime = 1;
    public int m_TimeToFirstStop = -1;
    public GasMix m_GasMix = GasMix.NONE;
    public int m_AscentMinute = -1;
    public int m_AscentSecond = -1;
    public double m_ChamberO2Periods = -1;
    public char m_RepeatGroup = '0';
    //Total Decompression Time
    public int m_TDT = 0;
    public int m_TDT_w_pause = 0;
    public int m_TotalPauseTime = 0;
    //ex) map[20] = 46, map [30] = 7, ...
    public SortedDictionary<int, int> m_DCompStops;
    //ex) if DCompStops[20] = 46, DCompStops[30] = 7, ... :
    //      map[30] = { 7 }, map[20] = { 23, 5, 23}
    //      under condition of MaxDCompTime = 30, pauseInterval = 5
    public SortedDictionary<int, List<int>> m_DComp_pauses_data;
    public SortedDictionary<int, int> m_DCompStops_including_pause_time;
    public bool isInitialized = false;
        */
    
    printDCompStops()
    {
        if (!isInitialized)
        {
            return "No Data";
        }
        let result = "";
        result = "Time to first stop : " + m_TimeToFirstStop.ToString() + "Total Ascent Time : " + m_AscentMinute.ToString() + "m " + (m_AscentSecond <= 0 ? "" : (m_AscentSecond.ToString() + "s")) + ", Repeat Group : " + m_RepeatGroup.ToString() + ", Chamber O2 Periods : " + m_ChamberO2Periods.ToString() + "\n";
        for (const [key, value] of Object.entries(this.m_DCompStops))
        {
            result += "Ft : " + key.ToString() + ", DCompTime(min) : " + value.ToString() + "\n";
        }
        return result;
    }

    constructor (bottomTime, timeToFirstStop, gasMix,  chamberO2Periods, repeatGroup, DCompTimeFromFile)
    {
        this.m_DCompStops = {};
        this.m_DComp_pauses_data = {};
        this.m_DCompStops_including_pause_time = {};

        for (let idx = 0; idx < DCompTimeFromFile.length; idx++)
        {
            this.m_DCompStops[(20 + idx * 10)] = DCompTimeFromFile[idx];
            this.m_TDT += DCompTimeFromFile[idx];
        }

        this.m_BottomTime = bottomTime;
        this.m_TimeToFirstStop = timeToFirstStop;
        this.m_GasMix = gasMix;
        this.m_ChamberO2Periods = chamberO2Periods;
        this.m_RepeatGroup = repeatGroup;

        this.UpdatePauseData();
        this.UpdateTimeIncludingPauses();

        this.isInitialized = true;
    }

    UpdateTimeIncludingPauses()
    {
        for (const [depth, data] of Object.entries(this.m_DComp_pauses_data))
        {
            let totalMinutes = 0;
            data.forEach(min=>totalMinutes += min)
            this.m_TDT_w_pause += totalMinutes;
            this.m_DCompStops_including_pause_time[depth] = totalMinutes;
        }
    }

    UpdatePauseData()
    {
        const maxDcompTime = 30;
        const pauseInterval = 5;
        const gasChangingTime = 2;
        let intervalFromLastPause = 0;
        let changeGas = true;

        const sortedDict = sortDict(this.m_DCompStops, true, false)
        //var reversed = this.m_DCompStops.OrderByDescending(i => i.Key);
        const reversed = sortedDict[0]

        reversed.forEach(key=>{
            const depth = key;
            const min = sortedDict[1][key];

            //init
            this.m_DComp_pauses_data[depth] = []

            switch (this.m_GasMix)
            {
                case GasMix.AIR:
                {
                    this.m_DComp_pauses_data[depth].push(min);
                }
                break;
                case GasMix.AIRO2:
                    {
                        if (depth === 30 || depth === 20)
                        {
                            if (changeGas && min != 0)
                            {
                                this.m_DComp_pauses_data[depth].push(gasChangingTime);
                                changeGas = false;
                            }
                            while (intervalFromLastPause + min >= maxDcompTime)
                            {
                                const done = maxDcompTime - intervalFromLastPause;
                                //dcomp (done)
                                this.m_DComp_pauses_data[depth].push(done);
                                this.m_DComp_pauses_data[depth].push(pauseInterval);
                                this.m_TotalPauseTime += pauseInterval;
                                min -= done;
                                intervalFromLastPause = 0;
                            }

                            //dcomp (min)
                            this.m_DComp_pauses_data[depth].push(min);
                            intervalFromLastPause += min;
                        }
                        else
                        {
                            this.m_DComp_pauses_data[depth].push(min);
                        }
                    }
                    break;
                case GasMix.NONE:
                default:
                    break;
            }
        })
    }
}

class DCompTable
{
    constructor ()
    {
        this.m_AirTable = {};
        this.m_AirO2Table = {};
    }

    //update DCompMatrix by index
    add(depth, row, gasMix)
    {
        this.m_AirTable[depth] = new DCompMatrix()
        this.m_AirO2Table[depth] = new DCompMatrix()
        switch (gasMix)
        {
            case GasMix.AIR:
                this.m_AirTable[depth].addDComp(row);
                break;
            case GasMix.AIRO2:
                this.m_AirO2Table[depth].addDComp(row);
                break;
            case GasMix.NONE:
            default:
                log("failed to add element on DCompTable");
                break;
        }

    }

    getTable(gasMix)
    {
        switch (gasMix)
        {
            case GasMix.AIR:
                return table = m_AirTable;
            case GasMix.AIRO2:
                return table = m_AirO2Table;
        }
        return undefined;
    }
}

class  DCompMatrix
{
    constructor (bottomDepth)
    {
        this.m_bottomTimesLUT = []
        this.bottomDepth = bottomDepth;
        this.m_DComps = {};
    }
    addDComp(newDCompRow)
    {
        this.m_DComps[newDCompRow.m_BottomTime] = newDCompRow;
        this.m_bottomTimesLUT.push(newDCompRow.m_BottomTime);
    }

    ToString()
    {
        return this.m_DComps[0].printDCompStops();
    }
}
