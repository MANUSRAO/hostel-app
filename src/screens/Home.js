// Main JS File
import { StyleSheet, Text, View, Button, Image, ActivityIndicator } from 'react-native'
import React, {useState, useEffect} from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';


const Home = () => {

    // Camera Permission State
    const [hasPermission, setHasPermission] = useState(null);
    // Scanned Status 
    const [scanned, setScanned] = useState(null);
    // Scanned Link
    const [text, setText] = useState("Not yet scanned");
    // Data Obtained
    const [myData, setMyData] = useState(null);
    // Loading Screen
    const [isLoaded, setIsLoaded] = useState(false);
    // Holiday State
    const [onHoliday, setOnHoliday] = useState(false);
    // Holiday Data
    const [holidayData, setHolidayData] = useState(null);
    // Holiday Loaded
    const [holidayLoaded, setHolidayLoaded] = useState(false);
    // Camera Permissions
    const askForCameraPermission = () => {
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      })()
    }

    // Clear Holiday :-
    // 1. Put Status in Student Table
    // 2. Complete Holiday Entry (PUT) in Holiday Table
    const clearHoliday = async () =>{
        try{  
            getHolidayData();
            if(holidayLoaded){
                // console.log("gshgdhsgdhsd")
                const data = holidayData;
              data.endDate = new Date().toISOString();
              let number = new Date(data.endDate) - new Date(data.startDate);
              number = number/(60000*60);
              if(number<0)
                data.numberOfDays = 0;
              data.numberOfDays = Math.floor(number);
              setHolidayData(data);
              const requestOptions = {
                method:'PUT',
                body: JSON.stringify(holidayData),
                headers:{'Content-Type':'application/json','Accept':'application/json'}
              }
              const link = "https://newmain-production.up.railway.app/holiday/"+holidayData.usn+"/";
              const response = await fetch(link,requestOptions);
              const realData = await response.json();
              setHolidayData(realData);
              getData();
              // console.log("put complete");
            }
        }
        catch (error) {
          // console.log("Error in holiday put:"+error);
        }
        try{
          const data = myData;
          data.onHoliday = false;
          setMyData(data);
          const requestOptions = {
            method:'PUT',
            body: JSON.stringify(myData),
            headers:{'Content-Type':'application/json','Accept':'application/json'}
          }
          const response = await fetch(text,requestOptions);
          const realData = await response.json();
          // console.log(realData);
          setMyData(realData);
          getData();
        }
        catch (error) {
          // console.log("Error in student PUT (False): "+error);
        }
    }


    // Mark Holiday :-
    // 1. Make entry in holiday table (POST)
    // 2. PUT status in student table
    const markHoliday = async () => {
      try{
        const data = JSON.stringify({'usn':myData.usn,'startDate':new Date().toISOString(),'endDate':null,'numberOfDays':null});
        const requestOptions = {
          method:'POST',
          body: data,
          headers:{'Content-Type':'application/json','Accept':'application/json'}
        };
        const link = "https://newmain-production.up.railway.app/holiday/admin/";
        const response = await fetch(link,requestOptions);
        const realData = await response.json();
        // setHolidayData(realData);
        // getData();
      }
      catch (error) {
        // console.log("Error in holiday POST: "+ error);
      }
      try{
        const data = myData;
        data.onHoliday = true;
        setMyData(data);
        setOnHoliday(true);
        const requestOptions = {
          method:'PUT',
          body: JSON.stringify(myData),
          headers:{'Content-Type':'application/json','Accept':'application/json'}
        }
        const response = await fetch(text,requestOptions);
        const realData = await response.json();
        setMyData(realData);
        getData();
      }
      catch (error) {
        // console.log("Error in student PUT (True): "+error);
      }
    }




    const getHolidayData = async () => {
      try{
        const link = text.replace("studentAPI","holiday");
        const response = await fetch(link,{method:'GET'});
        const realHolidayData = await response.json();
        setHolidayData(realHolidayData);
        // console.log("Data Below:")
        // console.log(realHolidayData);
        setHolidayLoaded(true);
      }
      catch(error){
        // console.log("Error in getting holiday data: "+error);
      }
    }

    const getData = async () => {
        try{
            const response = await fetch(text,{
              method: 'GET',
              headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json'  // I added this line
              }});
            const realData = await response.json();
            setMyData(realData);
            setOnHoliday(realData.onHoliday);
            if(realData.onHoliday)
              getHolidayData();
            // console.log("USN in getData:"+myData.usn);
            setIsLoaded(true);
            setScanned(true);
        }
        catch (error) {
            // console.log("Error in getting student data: "+error);
        }
    }




    useEffect(() => {
      askForCameraPermission();
    }, []);
    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        setText(data);
        // console.log('Type: ' + type + '\nData: ' + data);
        getData();
    };

    if(scanned==true && !isLoaded)
      getData();
    
    if (hasPermission === null) {
        return (
          <View style={styles.container}>
            <Text>Requesting for camera permission</Text>
          </View>)
    }



    if (hasPermission === false) {
        return (
          <View style={styles.container}>
            <Text style={{ margin: 10 }}>No access to camera</Text>
            <Button title={'Allow Camera'} onPress={() => askForCameraPermission()} />
          </View>)
    }



    return (
        <View style={styles.container}>
          {!scanned && !isLoaded && <Text style={styles.header}>Scan QR code</Text>}
          { !scanned && !isLoaded && 
          <View style={styles.barcodebox}>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={{ height: 400, width: 400 }} />
          </View>
            }
          {isLoaded  && !scanned && <ActivityIndicator size="large" color="#000000"/> }
          {isLoaded && (
          <View> 
            <View style={styles.card}>
            <View style={styles.imgContainer}>
              <Image style={styles.imgStyle} source={{ uri: myData.img }} />
            </View>
            <View>
              {!onHoliday && <View style={styles.mainContain}>
                <Text style={styles.myName}> Name: {myData.name} </Text>
                <Text style={styles.myName}> email: {myData.email} </Text>
                <Text style={styles.myName}> mobile: {myData.mobile} </Text>
                <Text style={styles.myName}> Branch: {myData.branch} </Text>
                <Text style={styles.myName}> Year: {myData.year} </Text>
                <Text style={styles.myName}> Room: {myData.room} </Text>
                <Text style={styles.myName}> Holiday Status: {onHoliday?"Yes, on Holiday.":"Not on Holiday"} </Text>
                <Button title={'Mark for Holiday'} onPress={()=>{
                markHoliday();
              }} color='blue'/>
              </View>}
              {
                onHoliday && <View style={styles.mainContainOnHoliday}>
                <Text style={styles.myName}> Name: {myData.name} </Text>
                <Text style={styles.myName}> email: {myData.email} </Text>
                <Text style={styles.myName}> mobile: {myData.mobile} </Text>
                <Text style={styles.myName}> Branch: {myData.branch} </Text>
                <Text style={styles.myName}> Semester: {myData.year} </Text>
                <Text style={styles.myName}> Room: {myData.room} </Text>
                <Text style={styles.myName}> Holiday Status: {onHoliday?"Yes, on Holiday.":"Not on Holiday"} </Text>
                <Button title={'Finish Holiday'} onPress={()=>{
                clearHoliday();
              }} color='green'/>
              </View>
              }
            </View>
          </View>
                    <Button title={'Scan again?'} onPress={() => {setScanned(false);setIsLoaded(false)}} color='tomato' />
          </View>
          )}
        </View>
    );
}


// Styling Component
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      },
      maintext: {
        fontSize: 16,
        margin: 20,
      },
      barcodebox: {
        display:"flex",
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
        width: 300,
        overflow: 'hidden',
        borderRadius: 30,
        backgroundColor: 'tomato'
      },
      header:{
        fontSize:25,
        borderColor:"black",
        zIndex:1000,
        marginBottom:25
      },
      mainContainer: {
        width: "100%",
        minHeight: "100%",
        paddingVertical: 50,
        backgroundColor: "#ebedee",
      },
      card: {
        width: 350,
        height: 500,
        backgroundColor: "#fff",
        borderRadius: 5,
        margin: 20,
      },
      bioDataContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#353535",
        paddingVertical: 10,
      },
      idNumber: {
        fontSize: 20,
        color: "rgba(255, 255, 255, 0.5)",
        paddingRight: 10,
      },
      bioData: {
        fontSize: 30,
        color: "#fff"
      },
      mainHeader: {
        fontSize: 30,
        color: "#a18ce5",
        textAlign: "center",
      },
      imgContainer: {
        padding: 10,
      },
      imgStyle: {
        width: "100%",
        height: 180,
      },
      mainContain: {
        padding: 10,
        backgroundColor: "#353535",
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
      },
      mainContainOnHoliday: {
        padding: 10,
        backgroundColor: "#FF0000",
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
      },
      myName: {
        fontSize: 14,
        color: "#fff",
        marginBottom: 10,
        alignSelf: "flex-start",
        textTransform: "capitalize",
      },
})
export default Home