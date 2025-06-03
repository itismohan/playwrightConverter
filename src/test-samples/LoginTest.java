// Sample Java Selenium test script for testing the converter
package com.example.tests;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import static org.junit.Assert.*;

import java.time.Duration;

public class LoginTest {
    private WebDriver driver;
    private WebDriverWait wait;

    @Before
    public void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.manage().window().maximize();
    }

    @Test
    public void testSuccessfulLogin() {
        // Navigate to the login page
        driver.get("https://example.com/login");
        
        // Find username and password fields and login button
        WebElement usernameField = driver.findElement(By.id("username"));
        WebElement passwordField = driver.findElement(By.id("password"));
        WebElement loginButton = driver.findElement(By.xpath("//button[@type='submit']"));
        
        // Enter credentials
        usernameField.clear();
        usernameField.sendKeys("testuser");
        passwordField.clear();
        passwordField.sendKeys("password123");
        
        // Click login button
        loginButton.click();
        
        // Wait for dashboard to load
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("dashboard")));
        
        // Verify successful login
        WebElement welcomeMessage = driver.findElement(By.className("welcome-message"));
        String messageText = welcomeMessage.getText();
        assertTrue(messageText.contains("Welcome, Test User"));
        
        // Check if logout button exists
        boolean logoutExists = driver.findElement(By.linkText("Logout")).isDisplayed();
        assertTrue(logoutExists);
    }
    
    @Test
    public void testFailedLogin() {
        // Navigate to the login page
        driver.get("https://example.com/login");
        
        // Find username and password fields and login button
        WebElement usernameField = driver.findElement(By.id("username"));
        WebElement passwordField = driver.findElement(By.id("password"));
        WebElement loginButton = driver.findElement(By.cssSelector("button.login-btn"));
        
        // Enter invalid credentials
        usernameField.sendKeys("wronguser");
        passwordField.sendKeys("wrongpass");
        
        // Click login button
        loginButton.click();
        
        // Wait for error message
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("error-message")));
        
        // Verify error message
        WebElement errorMessage = driver.findElement(By.className("error-message"));
        assertEquals("Invalid username or password", errorMessage.getText());
        
        // Verify we're still on the login page
        String currentUrl = driver.getCurrentUrl();
        assertTrue(currentUrl.contains("/login"));
    }

    @After
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
