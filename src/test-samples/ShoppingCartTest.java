// Sample Java Selenium test script with more complex features
package com.example.tests;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.JavascriptExecutor;
import static org.junit.Assert.*;

import java.time.Duration;
import java.util.List;

public class ShoppingCartTest {
    private WebDriver driver;
    private WebDriverWait wait;
    private Actions actions;
    private JavascriptExecutor js;

    @Before
    public void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        actions = new Actions(driver);
        js = (JavascriptExecutor) driver;
        driver.manage().window().maximize();
    }

    @Test
    public void testAddItemToCart() {
        // Navigate to the product page
        driver.get("https://example.com/products");
        
        // Wait for products to load
        wait.until(ExpectedConditions.presenceOfElementLocated(By.className("product-grid")));
        
        // Hover over the first product to show quick view button
        WebElement firstProduct = driver.findElement(By.cssSelector(".product-item:first-child"));
        actions.moveToElement(firstProduct).perform();
        
        // Click quick view button
        WebElement quickViewButton = driver.findElement(By.xpath("//button[contains(text(), 'Quick View')]"));
        quickViewButton.click();
        
        // Wait for quick view modal to appear
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("product-modal")));
        
        // Select product size from dropdown
        Select sizeDropdown = new Select(driver.findElement(By.id("size-select")));
        sizeDropdown.selectByVisibleText("Medium");
        
        // Select product color
        WebElement blueColorOption = driver.findElement(By.cssSelector("input[value='blue']"));
        blueColorOption.click();
        
        // Set quantity
        WebElement quantityInput = driver.findElement(By.id("quantity"));
        quantityInput.clear();
        quantityInput.sendKeys("2");
        
        // Add to cart
        WebElement addToCartButton = driver.findElement(By.id("add-to-cart"));
        addToCartButton.click();
        
        // Wait for confirmation message
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("cart-confirmation")));
        
        // Verify confirmation message
        WebElement confirmationMessage = driver.findElement(By.className("cart-confirmation"));
        assertTrue(confirmationMessage.getText().contains("Item added to your cart"));
        
        // Go to cart page
        WebElement viewCartButton = driver.findElement(By.linkText("View Cart"));
        viewCartButton.click();
        
        // Wait for cart page to load
        wait.until(ExpectedConditions.urlContains("/cart"));
        
        // Verify item in cart
        List<WebElement> cartItems = driver.findElements(By.className("cart-item"));
        assertEquals(1, cartItems.size());
        
        // Verify item details
        WebElement cartItem = cartItems.get(0);
        assertTrue(cartItem.getText().contains("Medium"));
        assertTrue(cartItem.getText().contains("Blue"));
        
        // Verify quantity
        WebElement quantityDisplay = cartItem.findElement(By.className("item-quantity"));
        assertEquals("2", quantityDisplay.getText());
        
        // Use JavaScript to check if cart icon shows correct count
        Long cartCount = (Long) js.executeScript("return parseInt(document.querySelector('.cart-count').textContent);");
        assertEquals(2, cartCount.intValue());
    }
    
    @Test
    public void testRemoveItemFromCart() {
        // First add an item to the cart
        driver.get("https://example.com/products/123");
        WebElement addToCartButton = driver.findElement(By.id("add-to-cart"));
        addToCartButton.click();
        
        // Wait for confirmation and go to cart
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("cart-confirmation")));
        driver.get("https://example.com/cart");
        
        // Wait for cart page to load
        wait.until(ExpectedConditions.presenceOfElementLocated(By.className("cart-item")));
        
        // Verify item exists in cart
        List<WebElement> cartItems = driver.findElements(By.className("cart-item"));
        assertTrue(cartItems.size() > 0);
        
        // Click remove button
        WebElement removeButton = driver.findElement(By.className("remove-item"));
        removeButton.click();
        
        // Wait for item to be removed
        wait.until(ExpectedConditions.invisibilityOf(cartItems.get(0)));
        
        // Verify cart is empty
        WebElement emptyCartMessage = driver.findElement(By.className("empty-cart-message"));
        assertTrue(emptyCartMessage.isDisplayed());
        assertEquals("Your cart is empty", emptyCartMessage.getText());
        
        // Verify cart count is zero
        WebElement cartCount = driver.findElement(By.className("cart-count"));
        assertEquals("0", cartCount.getText());
    }

    @After
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
