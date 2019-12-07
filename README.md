# Interactive Dog Camera 
  - Final project for Interactive Devices Fall 2019 
  
## Team:
  - Zhenwei Zhang (zz654) 
  - Zicong Wei (zz575)

## Project Description

This is the final project for IDD class at Cornell Tech. We are making an interactive pet camera that can detect dogs and dispense treats to them. It uses motion sensor to detect object and then the web cam will then start taking photos and utilize google vision API to detect dogs. If it successfully finds a dog, the servo will be activate and can dispense treats to the dog.  

## User Flow Diagram

![User Flow](https://github.com/ZhenweiZhang1995/interactive-dog-camera/blob/master/flow.png) 

## Parts 
- 1x Arduino Uno

- 1x Raspberry Pi

- 1x USB web camera

- 1x [PIR Motion Sensor](https://www.adafruit.com/product/189) 

- 1x [Micro Servo](https://www.adafruit.com/product/169) 

- CardBoard  


## Implementation

### Hardware 
#### The box
Overall, the box is made of thick black cardboard. We use laser cut machine to cut the big cardboard into smaller rectangles with size 15cm* 15cm and 15cm * 27cm. 

![CardBoard](https://github.com/ZhenweiZhang1995/interactive-dog-camera/blob/master/IMG_1653.JPG)
![CardBoard2](https://github.com/ZhenweiZhang1995/interactive-dog-camera/blob/master/IMG_1670.JPG) 
![CardBoard3](https://github.com/ZhenweiZhang1995/interactive-dog-camera/blob/master/IMG_1677.JPG) 

#### Food dispensing Mechanism 

We made a rotating disk using paper CardBoard and Laser Cutting machine and stick the servor to the top of the rotating part  

Video Demo Here (https://youtu.be/b2s0_Klr-UU)
![CardBoard3](https://github.com/ZhenweiZhang1995/interactive-dog-camera/blob/master/IMG_1672.JPG)


#### Circuit 

Similar to the Lab7 Door Bell, we connect the usb webcam and the arduino to the raspberry pi. On the arduino, we have the servo for food dispensing and the speaker for attracting dogs. 

![Circuit](https://github.com/ZhenweiZhang1995/interactive-dog-camera/blob/master/assmeble1.jpg)

Finally, we put everything together 
![Final look](https://github.com/ZhenweiZhang1995/interactive-dog-camera/blob/master/assemble2.jpg)


### Software  

There are two major parts for the software: Food dispensing and Dog detecting

#### Food Dispensing
The rotating part we mentioned earlier will rotate 60 degree each time it receives a signal. 

#### Dog detecting
We use google vision api(https://cloud.google.com/vision/docs/) to detect dogs.
```
async function labelDetect(input) {
   const [result] = await client.labelDetection(input).catch( e => {console.error(e)});
   const labels = result.labelAnnotations;
   console.log('Labels:');
   var foundDog = false;
   labels.forEach(function(item){
	if(item.description.toLowerCase() == 'dog'){
	   foundDog = true;
	}
   });
   console.log("FoundDog: " + foundDog);
   labels.forEach(label => console.log(label.description));
   if(foundDog){
      return true;
   }
   
}
```



 
