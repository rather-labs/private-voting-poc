use jwt::JWT;
use std::hash::keccak;
global MAX_DATA_LENGTH: u32 = 1024; // max length of signed data (headerb64 + "." + payloadb64)
global MAX_STRING_LENGTH: u32 = 21; // max length for string claim

fn main(
    data: BoundedVec<u8, MAX_DATA_LENGTH>,
    base64_decode_offset: u32,
    pubkey_modulus_limbs: [u128; 18],
    redc_params_limbs: [u128; 18],
    signature_limbs: [u128; 18],
    //email_extension: pub Field,
    election_id: pub Field
) -> pub [u64; 25] {
    let jwt = JWT::init(
        data,
        base64_decode_offset,
        pubkey_modulus_limbs,
        redc_params_limbs,
        signature_limbs,
    );

    jwt.verify();


    // Verify `email_verified` claim value is true
    jwt.assert_claim_bool(
        "email_verified".as_bytes(), 
        true
    );

    // Verify `iss` (issuer)
    jwt.assert_claim_string(
        "iss".as_bytes(), 
        BoundedVec::<u8, 32>::from_array("https://accounts.google.com".as_bytes())
    );

    // This could be used to verify an specific company email.
    //let email = jwt.get_claim_string::<5, MAX_STRING_LENGTH>("email".as_bytes());
    //println(f"email: {email}");
    //println(email.storage);
    
    // unique identifier
    let sub = jwt.get_claim_string::<3, MAX_STRING_LENGTH>("sub".as_bytes());
    //println(f"sub: {sub}");
    //println(sub.storage);

    // nullifier generation
    let mut hashInput: [u64; 25] = [election_id as u64; 25];
    let sub_storage = sub.storage();
    for i in 0..MAX_STRING_LENGTH { hashInput[i] = sub_storage[i] as u64; }
    let nullifier = keccak::keccakf1600(hashInput);
    nullifier
}