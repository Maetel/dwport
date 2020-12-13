// dependent to 

class DCompResult {
    constructor(){
        this.isInitialized = false

    }
}

class Controller{
    constructor(lines=""){
        if (!lines){
            lines = DataTable()
        }

        //variables
        this.g_stageDepth = -1;
        this.g_MaxDepth = -1;
        this.g_BottomTime = -1;
        this.g_FSW2Interval = -1;
        this.g_FSW2Time = -1;
        this.g_curDCompRow = undefined;
        this.g_GasMix = GasMix.NONE;
        this.g_DCompTable = new DCompTable()
        this.hTimes = new HSYSTimes();
        this.g_depthList = [];
        this.g_BTLUT = {};

        this.init(lines)
    }

    init(lines){
        //load data from string[] lines
        {
            let lineNumber = 0;
            lines.forEach(line=>{
                lineNumber++;

                //skip empty lines
                if (line.length <= 0)
                    return;

                //skip comments
                if (line[0].includes("#"))
                    return;

                const words = line.split(/ |,|:|\t/);
                const paramStartIdx = 6;
                const paramSize = words.length - paramStartIdx;

                ////data validity check
                let paramsContainChar = false;
                for (let idx = paramStartIdx; idx < words.length; idx++)
                {
                    if (!containsOnlyNumber(words[idx]))
                    {
                        paramsContainChar = true;
                        break;
                    }
                }
                if (paramSize <= 0
                    ||
                    !containsOnlyNumber(words[0]) ||
                    !containsOnlyNumber(words[1]) ||
                    !containsOnlyNumber(words[2]) ||
                    words[5].length != 1 ||
                    paramsContainChar
                    )
                {
                    log("Wrong input at line number : " + lineNumber);
                    log("wrong input. input words are : ");
                    let wrongWords = "";
                    words.forEach(word=>{wrongWords += word+", ";})
                    log(wrongWords);
                    return;
                }
                

                const depth = words[0];
                const BT = words[1];
                const to1st = words[2];

                let mix = GasMix.NONE;
                words[3] = words[3].toUpperCase();
                if (words[3] == "AIR" || words[3] == "A")
                { mix = GasMix.AIR; }
                else if (words[3] == "AIRO2" || words[3] == "O2" || words[3] == "AIR/O2" || words[3] == "O")
                { mix = GasMix.AIRO2; }
                //int totalAsc = words[4]);
                const chamberPeriod = words[4];
                const repeatGroup = words[5];

                const paramList = new Array(paramSize);
                for (let idx = paramStartIdx; idx < words.length; idx++)
                {
                    paramList[idx - paramStartIdx] = words[idx];
                }
                this.g_DCompTable.add(depth, new DCompRow(BT, to1st, mix, chamberPeriod, repeatGroup, paramList), mix);

            })
        }

        this._updateGlobalLUT();
    }

    _updateGlobalLUT()
    {
        //Matrix.m_bottomTimesLUT
        for (const [key, value] of Object.entries(this.g_DCompTable.m_AirTable))
        {
            this.g_depthList.push(key);
            this.g_BTLUT[key] = value.m_bottomTimesLUT;
        }

    }
}