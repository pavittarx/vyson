## url_shortner

The url shortner takes in a long url, and provides back a short url for the same.

- The database is local spawned using docker. You can start it from `~/containers/docker-compose.yaml`

## [Level: 0]

### Q1: Share the query used for creating the table.

```sql
  CREATE TABLE IF NOT EXISTS url_shortner(
        id SERIAL PRIMARY KEY,
        original_url TEXT NOT NULL,
        code VARCHAR(10) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
```

### Q2: Add 3-5 rows with sample data and share a screenshot of the table.

```

```

### Q3: Write a script in any programming language of your choice (Java, Python, Golang, Node.js, etc.) to add 1000 rows to the above table. Share the script and a screenshot of the table showing 1000+ entries. Note that you’re free to use AI (ChatGPT for help) as well. Just mention that you’ve used it in your submission doc.

### Q4: Find out the size of the table, i.e. how much storage was used to store 1000 URLs?

## [Level: 1]

### Q5: Do the same for 1M rows. Time your script, i.e. find how much time it takes to insert 1M rows. Also, find out the size of the table at this point.

### Q6: Do the same for 10M rows.

### Q7: Pick any 3-5 short codes from the table and write a SQL query to fetch their original URLs. How much time does it take?

### Q8: Run the query above 1M times using a loop. How much time does that take?

## [LEVEL: Extreme]

### Q9: Go back to Q6. Do the same for 100M rows. Note that it might take a lot of time to execute this one. Let your script run in background while you continue with your day-to-day work.

### Q10: Go back to Q8. Keep adding zeroes to see where it breaks. Run it 10M times. Run it 100M times. Run it 1B times.

### Q11: Do all the above steps for a NoSQL database as well (e.g. MongoDB or Firebase). Make sure that you are NOT using a cloud hosted version. You have to set it up locally.
