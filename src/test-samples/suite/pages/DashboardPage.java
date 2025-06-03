package com.example.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class DashboardPage {
    private WebDriver driver;
    private WebDriverWait wait;
    
    @FindBy(className = "welcome-message")
    private WebElement welcomeMessage;
    
    @FindBy(linkText = "Logout")
    private WebElement logoutButton;
    
    @FindBy(id = "dashboard-content")
    private WebElement dashboardContent;
    
    public DashboardPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        PageFactory.initElements(driver, this);
    }
    
    public boolean isWelcomeMessageDisplayed() {
        try {
            wait.until(ExpectedConditions.visibilityOf(welcomeMessage));
            return welcomeMessage.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    public String getWelcomeMessage() {
        if (isWelcomeMessageDisplayed()) {
            return welcomeMessage.getText();
        }
        return "";
    }
    
    public boolean isLogoutButtonDisplayed() {
        try {
            return logoutButton.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
    
    public void logout() {
        logoutButton.click();
        wait.until(ExpectedConditions.urlContains("/login"));
    }
    
    public boolean isDashboardLoaded() {
        try {
            wait.until(ExpectedConditions.visibilityOf(dashboardContent));
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
