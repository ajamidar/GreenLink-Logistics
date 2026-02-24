# 🚛 GreenLink Logistics

**Intelligent Logistics & Route Optimization Platform**

GreenLink Logistics is an enterprise-grade, full-stack logistics platform designed to solve the **Vehicle Routing Problem (VRP)** using a hybrid Java/Python architecture. It empowers businesses to optimize delivery routes, track drivers in real-time, and manage orders through a secure, modern dashboard.

Built with a cutting-edge tech stack, GreenLink demonstrates a seamless integration of high-performance backend logic with a responsive, map-centric frontend.

## ⚙️ Tech Stack

### **Frontend**
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=Leaflet&logoColor=white)

### **Backend**
![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=Spring-Security&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Pandas](https://img.shields.io/badge/pandas-%23150458.svg?style=for-the-badge&logo=pandas&logoColor=white)

### **DevOps & Cloud**
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

---

## 🔋 Features

### 🔐 Secure Authentication & RBAC

* **JWT-Based Security:** Stateless authentication using JSON Web Tokens.
* **Role-Based Access Control:** Distinct portals for **Dispatchers** (Admin) and **Drivers**.
* **Secure API:** Protected endpoints ensuring data privacy and integrity.

### 📍 AI-Powered Route Optimization

* **Hybrid Engine:** Java backend orchestrates a **Python subprocess** to run complex VRP algorithms.
* **Smart Routing:** Optimizes for shortest distance and time across multiple vehicles.
* **Automatic Assignment:** Instantly assigns unassigned orders to the most efficient driver.

### 🗺️ Real-Time Dispatcher Dashboard

* **Live Map Visualization:** Interactive **Leaflet** maps displaying routes, stops, and vehicle positions.
* **Auto-Refresh:** Real-time polling updates order statuses instantly without page reloads.
* **Visual Analytics:** At-a-glance statistics for total, pending, and completed deliveries.

### 📱 Mobile-First Driver Portal

* **Dedicated Interface:** A simplified, distraction-free web view designed for mobile devices.
* **One-Tap Navigation:** Simply choose your next stop, or change you start point.
* **Status Updates:** Drivers can mark orders as "DELIVERED" with a single tap, syncing instantly with the dashboard.

### 🚛 Fleet & Order Management

* **Full CRUD Capabilities:** Easily add, edit, or remove Vehicles and Orders.
* **Reverse Geocoding:** Automatically converts raw GPS coordinates into human-readable addresses using **OpenStreetMap**.
* **Capacity Planning:** Manages vehicle weight limits and service duration constraints.

### ☁️ Cloud-Native & Scalable

* **Dockerized:** Fully containerized backend (Java+Python) and frontend for consistent deployment.
* **AWS Ready:** Configured for deployment on **AWS EC2** (Compute) and **RDS** (Database).
* **Production Grade:** Includes structured logging, error handling, and environment configuration.

### 🧑‍💻 Demo

* I am attaching below a demo of the web app as because it is hosted as an EC2 instance, to prevent unnecessary billing from AWS, it is not live 24/7. 
* [![Watch the video](https://img.youtube.com/vi/N4sF84_3fSA/maxresdefault.jpg)](https://youtu.be/N4sF84_3fSA)
