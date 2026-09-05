<?php
    // Include the database connection
    include('../connect.php');

    // Get the ID from the URL
    $id = $_GET['id'];
    $type = $_GET['type'];
    $invoice_no = $_GET['invoice_no'];
    
    $amount = $_GET['amount'];
    $paid_amount = $_GET['paid_amount'];
    $balance = $_GET['balance'];

    // Query to fetch the udhar customer data based on the ID
    $result = $db->prepare("SELECT * FROM udhar_suplier WHERE id = :userid");
    $result->bindParam(':userid', $id);
    $result->execute();

    // Loop to fetch the record
    if ($row = $result->fetch()) {
?>
<meta charset="UTF-8">
 
<!-- Include stylesheet -->
<link href="../style.css" media="screen" rel="stylesheet" type="text/css" />

<!-- Start of the form -->
<form action="saveditsudhar.php" method="post" style="font-family: 'Noto Nastaliq Urdu' !important;  text-align: center; padding-top: 35px">
    <center><h4><i class="icon-edit icon-large"></i> ادھار کی ترمیم کریں</h4></center>
    <hr>

    <div id="ac">
        <!-- Hidden field to hold the ID -->
        <input type="hidden" name="id" value="<?php echo $id; ?>" />

        <!-- Loan Type (Baqaya len or Baqaya den) -->
        <div class="form-group" >
            <?php
            if ($type == "Baqaya den") {
                echo '<span style="width: 155px !important; margin-left: 120px">براہِ کرم اپنا بقایا واپس لے لیں </span>';

            } else {
                echo '<span style="width: 150px !important; margin-left: 120px">براہِ کرم بقایا واپس دے دیں </span>';

            }
            ?>
        </div>

        <!-- Cash field -->
        <div class="form-group" >
            <input type="hidden"  name="type" value="<?php echo $type; ?>" placeholder="نقد رقم" style="width: 268px; height:30px;" required/>
        </div>
        <input type="hidden"  name="invoice_no" value="<?php echo $invoice_no; ?>" placeholder="نقد رقم" style="width: 268px; height:30px;" required/>

        <input type="hidden"  name="amount" value="<?php echo $amount; ?>" placeholder="نقد رقم" style="width: 268px; height:30px;" required/>
        <input type="hidden"  name="paid_amount" value="<?php echo $paid_amount; ?>" placeholder="نقد رقم" style="width: 268px; height:30px;" required/>
        <input type="hidden"  name="balance" value="<?php echo $balance; ?>" placeholder="نقد رقم" style="width: 268px; height:30px;" required/>

        <!-- Cash field for remaining amount -->
        <div class="form-group">
            <input type="number" style="padding:
15px;
  width: 246px; direction: rtl; font-family: 'Noto Nastaliq Urdu' !important;" name="cash" placeholder="بقایا رقم" style="width: 268px; height:30px; margin-bottom: 15px;" required/>
        </div>

        <!-- Remarks field -->
        <div class="form-group">
            <label for="remarks" style="direction: rtl; margin-top: 5px; margin-bottom: 10px;margin-left: 120px">لین دین کی صورت میں تفصیل: </label>
            <textarea name="remarks" style="width: 265px; height: 60px; direction: rtl; font-family: 'Noto Nastaliq Urdu' !important;"><?php echo $row['remarks']; ?></textarea>
        </div>

        <!-- Save Button -->
        <div class="form-group" style="margin-left: 80px">
            <button class="btn btn-success btn-block btn-large" style="width: 200px;  direction: rtl; font-family: 'Noto Nastaliq Urdu' !important;" style="width: 267px;">
                <i class="icon icon-save icon-large"></i> تبدیلیاں محفوظ کریں
            </button>
        </div>
    </div>
</form>

<?php
    } // End of the loop
?>
