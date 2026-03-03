POST
/api/seller-request
Submit seller request


Parameters
Try it out
No parameters

Request body

multipart/form-data
shopName *
string
discription *
string
campusLocation *
string
mainPhone *
string
secondaryPhone
string
categoryId *
string
agreedToRules *
boolean
instagram
string
telegram
string
tiktok
string
other
string
image *
array<string>
Two images (front/back ID)

profileImage
array<string>
One profile image

Responses
Code	Description	Links
201	
Seller request submitted

No links
400	
Validation error

No links
409	
Conflict