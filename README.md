# Sync Room - Frontend
**Listen Together, Stay in Sync**  

Welcome to the frontend repository of **Sync Room**, a collaborative music listening platform that lets users create rooms, add songs, and enjoy perfectly synced playback with friends in real time.  

---

## 🌟 About Sync Room  

Sync Room is an innovative app built using **AWS Cloud Architecture** to provide a seamless and scalable experience for music lovers around the globe. Whether it's a party, study session, or a casual hangout, Sync Room keeps everyone in tune, no matter the distance.  

---

## 🛠️ Tech Stack  

### Frontend  
- **React.js**: For building a fast and responsive user interface.  
- **TailwindCSS**: For styling and layout consistency.  
- **Context API**: For managing global state and data sharing.  

### Backend (AWS-Powered)  
The backend architecture is built entirely on AWS for high performance and reliability. Below is a diagram representing the architecture:
```mermaid
graph TD;

    subgraph AWS Cloud
        subgraph Frontend Hosting
            Route53[Route 53 - Custom Domain] -->|DNS Resolution| CloudFront[CloudFront - CDN]
            CloudFront -->|Distributes| S3[S3 - Frontend Hosting]
            User[User] -->|Access UI| Route53
        end

        subgraph API & Backend
            User -->|API Calls| API_Gateway[API Gateway]
            API_Gateway -->|Triggers| Lambda_Functions[Lambda Functions]
            Lambda_Functions -->|Read/Write| DynamoDB[(DynamoDB + DAX)]
            Lambda_Functions -->|Logs & Metrics| CloudWatch[CloudWatch]
        end

        subgraph Real-Time Sync
            WebSocket[WebSocket API Gateway] --> WebSocket_Lambda[Lambda for Sync Logic]
            WebSocket_Lambda -->|Update Sync Status| DynamoDB
        end

        subgraph Playback Management
            PlaybackStateTable[MusicRoomPlaybackState Table] -->|Track State| Lambda_Functions
            RoomSongsTable[MusicRoomSongs Table] -->|Manage Songs| Lambda_Functions
            ConnectionsTable[MusicRoomConnections Table] -->|Track Users| Lambda_Functions
        end

        subgraph Scheduled Cleanup
            EventBridge[EventBridge Scheduler] -->|Triggers Cleanup Lambda| CleanupLambda[Lambda - Room Cleanup]
            CleanupLambda -->|Removes Inactive Rooms| DynamoDB
        end

        subgraph Monitoring
            CloudWatch -->|Logs & Metrics| CloudWatch_Dashboard[CloudWatch Dashboard]
        end

        API_Gateway -->|Serve UI| CloudFront
    end

    User -->|Frontend Requests| API_Gateway
    User -->|Real-Time Playback Sync| WebSocket



#### Key Services Used:  
- **Amazon S3**: For static asset storage.  
- **API Gateway**: To manage HTTP and WebSocket requests.  
- **Lambda Functions**: To handle backend logic.  
- **DynamoDB with DAX**: For fast and efficient database operations.  
- **CloudWatch**: For real-time monitoring and metrics.  

---

## 🌐 Live Demo  

Experience Sync Room live at: [Sync Room App](https://www.syncroomnow.com/)

---

## 🚀 Highlights  

- **Cloud-First Design**: Fully architected on AWS, ensuring reliability, scalability, and low latency.  
- **Seamless Music Sync**: Users in the same room listen to music in perfect synchronization.  
- **User-Friendly Interface**: An intuitive and responsive design for effortless use on any device.  

---

## 📧 Contact  

Have questions or feedback? Feel free to reach out:  
- **LinkedIn**: [Sruthik](https://www.linkedin.com/in/sruthik-issac-5b9119198/)  
- **Email**: sruthik2016@gmail.com 

---

Sync Room — **Listen Together, Stay in Sync**.  

--- 
