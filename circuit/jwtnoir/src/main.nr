use jwt::JWT;
use std::hash::poseidon2;

global MAX_DATA_LENGTH: u32 = 1024; // max length of signed data (headerb64 + "." + payloadb64)
//global MAX_NONCE_LENGTH: u32 = 32; // we are verifying `nonce` claim
//global MAX_EMAIL_LENGTH: u32 = 32; // max length for email claim
//global MAX_KEY_LENGTH: u32 = 5; // max length for claim keys

fn main(
    data: BoundedVec<u8, MAX_DATA_LENGTH>,
    base64_decode_offset: u32,
    pubkey_modulus_limbs: [u128; 18],
    redc_params_limbs: [u128; 18],
    signature_limbs: [u128; 18],
    election_id: pub Field
) -> pub Field {
    let jwt = JWT::init(
        data,
        base64_decode_offset,
        pubkey_modulus_limbs,
        redc_params_limbs,
        signature_limbs,
    );

    jwt.verify();

    //let email = jwt.get_claim_string::<MAX_KEY_LENGTH, MAX_EMAIL_LENGTH>("email".as_bytes());
    //println(f"email: {email}");
    // unique 
    let sub: u64 = jwt.get_claim_number("sub".as_bytes());
    println(f"sub: {sub}");
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
    // nullifier with 
    //sub: unique google identifier
    // election_id
    let nullifier = poseidon2::Poseidon2::hash([sub as Field, election_id], 2);
    println(f"nullifier: {nullifier}");
    nullifier 
}