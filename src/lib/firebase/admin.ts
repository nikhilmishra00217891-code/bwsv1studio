
import { initializeApp, getApps, cert, getApp, App } from "firebase-admin/app";

// This function ensures that the Firebase Admin SDK is initialized only once.
export const customInitApp = (): App => {
    if (getApps().length > 0) {
        return getApp();
    }
    
    // The service account key is directly embedded here to avoid all parsing issues.
    // The private_key is wrapped in backticks (`) to handle newlines correctly.
    const serviceAccount = {
      "type": "service_account",
      "project_id": "biharwalesirji-w4n4b",
      "private_key_id": "ac5ae8c128704439d00712423b3fc8ea03d5efe7",
      "private_key": `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDjUZ9M+bo2Jnbn\n70LxTzGZgGDnWV+cPXfXJQbYmztQvLmnWhjWDQLaKQla6Jg4oYaZFpVc8AkIMZvF\ndMwVzKJjLpBw9gzi2rlnC6c1+nzn9ut40Njsude9gj7v26OWF1iP7i+eCPdmwCwK\nCH6L2FIqq/07/jDNqxAHSRtgCSrzzn7eYnDupn/qqbjvKGZN5cnpFranSj+fH0JG\n/c1Jy+B2v3Ho1Q9zuzDLDOxjqjUZn4hIwTc+e+ncteLsyeYKTSCsta3ysQeQ0K+w\n0vkhtgr9ukKQTaJD8x6IQOVmHZx17/XotMwdHXRdhnvvLXr/QIef6B458Xj7xT5Y\n04Dfaq/bAgMBAAECggEAC48Ydx0Ru3QsQrH3aPbaclBFXS49vt+fSujelsAZ/YqD\nND/QGH5T4U0J5T4Dk4mfIwSzdqTcCLchESLVx9v+e+Wfwaa5VAXEPLmqeIOyu0bi\nhWO1TCBNGJ1ZXu//uv+X6MW3VSVmkyp9cssoyCqpTvMs7tKHn8WtjHlKs5Dzxq7m\nVhBrRJHJ9Upis+KnmKj5PVl3Uhevwf73tH0tv28+WVz0P+lJwYcKyC4USXlaZ9jT\n87OJi+xMOrEo6G/P9qs36d8sHdpgipmsLjzBORrdnoIvEG4rh6kqQWIr0neFMSAr\ndzVLCMIsijVARnb6tD3htMWaQvWabpzJDC8nUEMXpQKBgQD7Dz+IbIVmF18p5gVf\noht4XpcaAQrPH5ZU4ImOuBH6YkEKU2lawWD4+zhlltMy69fw6PxGbdyD1y4ypmns\ngukwe4UK0t4r7uj5DdOUVfRMOTKfrtu+Ko63zVuRU6AWtwVbOjn0VHlOWiDGuOm9\nINdP+UTzS9oFlLdsKKA66+DmbQKBgQDnysbGyRsbWwrz9I9rW1rwOYPmlVjW9gLc\nxa4vsi7VjkRvlU128r4PKExUIkCHaAdxidQhwHbThzWZfZdKzham3H1+5vCErMI0\nPjc+jP0b9YRnfZmvuLNDPGFWU+n6nW8SaeYaMKNvJ3rfcin+iJjtFgo31LaXEYma\nV9LTsHGiZwKBgQCdWq1DYGEr37IxnI35pqz5ALBMCCMyNmYOxLzyysPZ3wNM6YK6\n80FITIzIf4PYAqHRyPV1Xx47M/8sl8kEB/kH/iMg6ZF+j7tNfjECY+0+aQslsn7f\n7eSNpxShPXy1P/kHeLMiRF/TkAHDC9rUQ2UwJtfkdcIshU2BaOUkiPro8QKBgDMg\nz2fZxFjsZCYbs+cCZ7TFewrJtqbz7P21vQ5YR2xjzUSvsj6inLnLMcr9Iy67C6lH\ntbscMRnHoVMSGOUvQF/eEvCDEFqzoMLVVmo9vzcDmQka82OHYkNadj4MlHfrciyl\nn1P3lpVWKAxRqmGyz8i8K9TU3tHD1I5vANog+W/RAoGBANmq6LtCfLzqkX/SClxy\nW3n5rjcrldtQr+ApntJlWWLbS4hILYvab20Okk5ZiQAfTIOKzbnQj+vjmRS6mjJ9\nEs8o6h1gA7gtG3G3LV53bzC3axzl7y9dM7kzWb/S8R1qR7xv5b/ZkUEkuCpaGTqI\n2zSVGdGXQdAMch9ophl+p5AU\n-----END PRIVATE KEY-----\n`,
      "client_email": "firebase-adminsdk-fbsvc@biharwalesirji-w4n4b.iam.gserviceaccount.com",
      "client_id": "117626340914465833361",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40biharwalesirji-w4n4b.iam.gserviceaccount.com",
      "universe_domain": "googleapis.com"
    };

    return initializeApp({
        credential: cert(serviceAccount),
    });
}

    