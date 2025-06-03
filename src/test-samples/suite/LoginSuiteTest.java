// Sample Java Selenium test suite for testing batch conversion
package com.example.tests.suite;

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

import com.example.pages.LoginPage;
import com.example.pages.DashboardPage;
import com.example.utils.TestUtils;

import java.time.Duration;

public class LoginSuiteTest {
    private WebDriver driver;
    private WebDriverWait wait;
    private LoginPage loginPage;
    private DashboardPage dashboardPage;

    @Before
    public void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.manage().window().maximize();
        
        loginPage = new LoginPage(driver);
        dashboardPage = new DashboardPage(driver);
    }

    @Test
    public void testSuccessfulLogin() {
        // Navigate to the login page
        driver.get("https://example.com/login");
        
        // Login using page object
        loginPage.login("testuser", "password123");
        
        // Wait for dashboard to load
        TestUtils.waitForPageLoad(driver);
        
        // Verify successful login
        assertTrue(dashboardPage.isWelcomeMessageDisplayed());
        assertEquals("Welcome, Test User", dashboardPage.getWelcomeMessage());
        
        // Check if logout button exists
        assertTrue(dashboardPage.isLogoutButtonDisplayed());
    }
    
    @Test
    public void testFailedLogin() {
        // Navigate to the login page
        driver.get("https://example.com/login");
        
        // Attempt login with invalid credentials
        loginPage.login("wronguser", "wrongpass");
        
        // Verify error message
        assertTrue(loginPage.isErrorMessageDisplayed());
        assertEquals("Invalid username or password", loginPage.getErrorMessage());
        
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
