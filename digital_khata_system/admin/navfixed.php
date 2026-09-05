<?php
session_start();
include('../connect.php');
?>
<div class="navbar navbar-inverse navbar-fixed-top">
  <div class="navbar-inner">
    <div class="container-fluid" style="background-color: #63C592FF;">
      <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </a>
      <a class="brand" href="index.php"><b>ڈیجی کھاتہ سسٹم</b></a>

      <div class="nav-collapse collapse">
        <ul class="nav pull-right" style="display: flex; align-items: center; gap: 15px;">
          
          <!-- Profile image - click to open modal -->
          <li>
              <a href="editprofile.php" rel="facebox">
                <?php
                  $user_id = $_SESSION['SESS_MEMBER_ID'];
                  $result = $db->prepare("SELECT profile_image FROM user WHERE id = :id");
                  $result->execute([':id' => $user_id]);
                  $user = $result->fetch();
                  $img = !empty($user['profile_image']) ? $user['profile_image'] : 'images/default.png';
                ?>
                <img src="<?php echo $img; ?>" style="width:25px; height:25px; border-radius:50%; border:2px solid white;">
              </a>
            </li>

          <!-- Welcome text -->
          <li><a><i class="icon-user icon-large"></i> خوش آمدید:
            <strong><?php echo $_SESSION['SESS_LAST_NAME'];?></strong></a></li>

          <!-- Current date -->
          <li><a><i class="icon-calendar icon-large"></i>
            <?php
              $Today = date('Y-m-d');
              $new = date('l, F d, Y', strtotime($Today));
              echo $new;
            ?>
          </a></li>

          <!-- Logout -->
          <li><a href="../index.php"><font color="red"><i class="icon-off icon-large"></i></font> لاگ آؤٹ</a></li>
        </ul>
      </div>
    </div>
  </div>
</div>
