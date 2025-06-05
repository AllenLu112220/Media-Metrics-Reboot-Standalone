# Media-Metrics-Reboot
## Getting Started
Welcome! This guide will walk you through setting up and running the project.
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Running The Project](#running-the-project)

### Prerequisites
Python Version: 3.8.9+  
check version by
```
python --version
```
Node.js Version: v20.18.0+  
NPM Version: 10.8.2+  
check versions by
```
node -v
npm -v
```

### Setup Instructions
Clone Repository
```
clone git https://github.com/dparcheta/Media-Metrics-Reboot.git
cd Media-Metrics-Reboot
```
Create Virtual Environment (Optional but Recommended)  
```
python -m venv venv
# Activate the virtual environment
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt
```
Set Up JavaScript Dependencies
```
cd ui
npm install
```

### Setup Database Instructions
Our program includes four data tables USER, SearchQueries, Article, and Article_queries.
The USER data table is the only table not managed by Django meaning we must create the other three tables prior.
Step 1. After cloning the project and setting up all required dependencies, navigate to DjangoMediaMetrics/DjangoMediaMetrics/settings.py.
Step 2. Scroll to the `DATABASES` section (around line 151).
Step 3. Update the `NAME`, `USER`, `PASSWORD`, `HOST`, and `PORT` fields to match your target database.
Step 4. Ensure the `mysqlclient` library is installed: pip install mysqlclient
Step 5. After entering the required information, switch back to your database using your preferred platform and create the following data tables.
CREATE TABLE `SearchQueries` (
  `QueryID` int NOT NULL AUTO_INCREMENT,
  `Keyword` varchar(200) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `UserID` int DEFAULT NULL,
  `date_queried` date DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `article_type` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`QueryID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `SearchQueries_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `USER` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=1139 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `Article` (
  `DateOfBroadcast` date DEFAULT NULL,
  `Headline` varchar(500) DEFAULT NULL,
  `Subline` varchar(1000) DEFAULT NULL,
  `URL` varchar(1000) DEFAULT NULL,
  `ParsedDomain` varchar(255) DEFAULT NULL,
  `Image` varchar(1000) DEFAULT NULL,
  `Author` varchar(255) DEFAULT NULL,
  `ArticleType` varchar(100) DEFAULT NULL,
  `PublicationName` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `ID` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`ID`),
  FULLTEXT KEY `Headline` (`Headline`,`Subline`)
) ENGINE=InnoDB AUTO_INCREMENT=27398 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `Article_queries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `article_id` int NOT NULL,
  `searchqueries_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_article_id` (`article_id`),
  KEY `idx_searchqueries_id` (`searchqueries_id`),
  CONSTRAINT `fk_article_id` FOREIGN KEY (`article_id`) REFERENCES `Article` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `fk_searchqueries_id` FOREIGN KEY (`searchqueries_id`) REFERENCES `SearchQueries` (`QueryID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11845 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

Make sure the database name used matches the NAME field in settings.py.

Step 6. Back in your project directory, run: python manage.py migrate     
Step 7. You're now ready to run the project!

### Running The Project
Activate virtual environment  
Backend (Python)
```
cd Media-Metrics-Reboot/DjangoMediaMetircs
python manage.py runserver
```
Frontend
```
cd Media-Metrics-Reboot/ui
npm start
```

