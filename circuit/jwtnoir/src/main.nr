use jwt::JWT;
use std::hash::poseidon2;

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
) -> pub Field {
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

    // nullifier generation
    let mut hashInput: [Field; MAX_STRING_LENGTH+1] = [election_id; MAX_STRING_LENGTH+1];
    for i in 0..MAX_STRING_LENGTH { hashInput[i] =  sub.storage()[i] as Field; }

    let nullifier = poseidon2::Poseidon2::hash(hashInput, MAX_STRING_LENGTH+1);
    nullifier
}
