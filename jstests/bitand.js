t = db.bitand;
t.drop();

FLAG_A = 0x1;
FLAG_B = 0x2;
FLAG_C = 0x4;
FLAG_D = 0x8;
FLAG_E = NumberLong( 0, 0xffffffff, 0xfffffffe ); // 63 high bits set
FLAG_F = NumberInt( 0xfffffff8 ); // 29 high bits set
FLAG_G = NumberLong( 0, 0x80000000, 0x00000004 );

t.save( { a : 0 } );
t.save( { a : FLAG_A } );
t.save( { a : FLAG_B, name : "upd" } );
t.save( { a : FLAG_C } );
t.save( { a : FLAG_D } );
t.save( { a : FLAG_C | FLAG_A } );
t.save( { a : FLAG_E } );
t.save( { a : NumberInt( FLAG_F ) } );
t.save( { a : FLAG_G } );
t.save( { a : "foobar" } );

function assertBitAnd( matchCondition, expectedAValues ) {
    var expectedFlagsObjects = [];
    expectedAValues.forEach( function ( flag ) {
        expectedFlagsObjects.push( { a : flag } );
    } );
    assert.eq( t.find( { a : matchCondition }, {
        _id : 0,
        a : 1
    } ).sort( { _id : 1 } ).toArray(), expectedFlagsObjects );
}

assertBitAnd( { $bitAnd : FLAG_C }, [ FLAG_C, FLAG_C | FLAG_A, FLAG_E, FLAG_G ] );
assertBitAnd( { $bitAnd : FLAG_A | FLAG_C }, [ FLAG_A, FLAG_C, FLAG_C | FLAG_A, FLAG_E, FLAG_G ] );
assertBitAnd( { $bitAnd : FLAG_B }, [ FLAG_B, FLAG_E ] );
assertBitAnd( { $bitAnd : FLAG_A | FLAG_B | FLAG_C }, [ FLAG_A, FLAG_B, FLAG_C, FLAG_C | FLAG_A, FLAG_E, FLAG_G ] );
assertBitAnd( { $bitAnd : 0 }, [] );
assertBitAnd( { $bitAnd : FLAG_D }, [ FLAG_D, FLAG_E, FLAG_F ] );
assertBitAnd( { $bitAnd : 16 }, [ FLAG_E, FLAG_F ] );
assertBitAnd( { $bitAnd : 2147483648 }, [ FLAG_E, FLAG_F ] );
assertBitAnd( { $bitAnd : NumberLong( 0, 0x80000000, 0x00000000 ) }, [ FLAG_E, FLAG_G ] );

// combined
assertBitAnd( { $lte : 0, $bitAnd : FLAG_C }, [ FLAG_E, FLAG_G ]);
